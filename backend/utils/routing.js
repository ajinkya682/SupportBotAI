const User = require('../models/User');
const Conversation = require('../models/Conversation');

/**
 * Auto-route a ticket to the best available agent.
 * Priority: Online & Free → skip Busy (in_conversation) → skip Offline/Away
 * If no free agent found, ticket goes to 'holding' state.
 */
/**
 * Auto-route a ticket to the best available agent.
 * Scenario 1 & 2: Online & Free (status: 'online') -> Pick random
 * Scenario 3: All Busy (status: 'in_conversation') -> Pick random, label 'holding'
 * Scenario 4: All Offline -> Mark 'unassigned'
 */
const routeTicket = async (conversationId, io) => {
    try {
        // Atomic check: Ensure ticket is still pending assignment
        const conversation = await Conversation.findOneAndUpdate(
            { _id: conversationId, routingStatus: { $in: ['pending', 'holding'] } },
            { $set: { routingStatus: 'assigning' } },
            { new: true }
        ).populate('business');

        if (!conversation) return;

        const ownerId = conversation.business.owner;
        if (!ownerId) {
            conversation.routingStatus = 'pending';
            await conversation.save();
            return;
        }

        // 1. Try to find FREE & ONLINE agents
        const freeAgents = await User.find({
            ownerId: ownerId,
            role: 'agent',
            status: 'online',
        });

        if (freeAgents.length > 0) {
            const selectedAgent = freeAgents[Math.floor(Math.random() * freeAgents.length)];
            return await assignToAgent(conversation, selectedAgent, 'assigned', io);
        }

        // 2. No free agents? Try to find BUSY agents
        const busyAgents = await User.find({
            ownerId: ownerId,
            role: 'agent',
            status: 'in_conversation',
        });

        if (busyAgents.length > 0) {
            const selectedAgent = busyAgents[Math.floor(Math.random() * busyAgents.length)];
            // routingStatus 'holding' means "Waiting for You" on the console
            return await assignToAgent(conversation, selectedAgent, 'holding', io);
        }

        // 3. All Offline or no agents exist
        conversation.routingStatus = 'unassigned';
        await conversation.save();

        io.to(ownerId.toString()).emit('new_ticket_unassigned', {
            conversationId: conversation._id,
            reason: 'All agents are Offline',
        });

        return null;
    } catch (error) {
        console.error('Routing error:', error);
    }
};

/**
 * Atomic assignment helper
 */
async function assignToAgent(conversation, agent, routingStatus, io) {
    conversation.assignedAgentId = agent._id;
    conversation.agent = agent._id;
    conversation.routingStatus = routingStatus;
    conversation.assignedAt = new Date();
    await conversation.save();

    const ownerId = conversation.business.owner;
    const agentPayload = {
        ...conversation.toObject(),
        assignedAgentName: agent.displayName || agent.name,
    };

    // Notify the specific agent via socket
    io.to(`agent_${agent._id}`).emit('agent_assigned', agentPayload);

    // ── PUSH NOTIFICATION ──────────────────────────────────────────────────
    const pushService = require('./pushService');
    const isHighIntent = conversation.priority === 'high';
    
    await pushService.sendNotification(agent._id, {
        type: isHighIntent ? 'high_intent' : 'assigned',
        title: isHighIntent ? '🔴 Urgent Ticket Assigned' : '🎫 New Ticket Assigned',
        body: `${conversation.userName || 'Guest'} needs help with ${conversation.intent || 'support'}.`,
        sound: isHighIntent ? 'high_intent' : 'assigned',
        data: {
            url: `/dashboard`, // Agent console
            conversationId: conversation._id
        }
    });

    // Update the owner dashboard
    io.to(ownerId.toString()).emit('ticket_assigned', {
        conversationId: conversation._id,
        agentId: agent._id,
        agentName: agent.displayName || agent.name,
        routingStatus
    });

    return agent;
}

/**
 * When an agent comes online, check for any holding/unassigned tickets and route them.
 */
const checkHoldingTickets = async (ownerId, io) => {
    try {
        const businessIds = await getBusinessIdsForOwner(ownerId);
        const pendingTickets = await Conversation.find({
            business: { $in: businessIds },
            routingStatus: { $in: ['holding', 'unassigned', 'pending'] },
        }).sort({ createdAt: 1 });

        for (const ticket of pendingTickets) {
            await routeTicket(ticket._id, io);
        }
    } catch (error) {
        console.error('Check holding tickets error:', error);
    }
};

async function getBusinessIdsForOwner(ownerId) {
    const Business = require('../models/Business');
    const businesses = await Business.find({ owner: ownerId });
    return businesses.map((b) => b._id);
}

module.exports = { routeTicket, checkHoldingTickets };
