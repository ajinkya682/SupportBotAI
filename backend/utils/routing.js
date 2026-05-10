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
        const conversation = await Conversation.findOneAndUpdate(
            { _id: conversationId, routingStatus: { $in: ['pending', 'holding', 'unassigned'] } },
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

        // 1. Get all agents for this owner
        const agents = await User.find({
            ownerId: ownerId,
            role: 'agent',
            status: { $in: ['online', 'away'] } // Only route to online/away agents
        });

        if (agents.length === 0) {
            // No agents online -> Pending (Owner dashboard)
            conversation.routingStatus = 'pending';
            await conversation.save();
            io.to(`owner_${ownerId}`).emit('new_ticket_pending', conversation);
            return null;
        }

        // 2. Workload-aware selection
        // An agent is "free" if they have 0 conversations with routingStatus 'in_progress' or 'assigned'
        const agentWorkloads = await Promise.all(agents.map(async (agent) => {
            const count = await Conversation.countDocuments({
                assignedAgentId: agent._id,
                routingStatus: { $in: ['assigned', 'in_progress'] }
            });
            return { agent, count };
        }));

        // Sort by workload (ascending)
        agentWorkloads.sort((a, b) => a.count - b.count);

        const bestOption = agentWorkloads[0];

        if (bestOption.count === 0) {
            // Free agent found!
            return await assignToAgent(conversation, bestOption.agent, 'assigned', io);
        } else {
            // All online agents are busy -> Holding (Owner dashboard)
            conversation.routingStatus = 'holding';
            await conversation.save();
            io.to(`owner_${ownerId}`).emit('new_ticket_holding', conversation);
            return null;
        }
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
    io.to(`owner_${ownerId}`).emit('ticket_assigned', {
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
