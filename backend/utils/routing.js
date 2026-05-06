const User = require('../models/User');
const Conversation = require('../models/Conversation');

/**
 * Auto-route a ticket to the best available agent.
 * Priority: Online & Free → skip Busy (in_conversation) → skip Offline/Away
 * If no free agent found, ticket goes to 'holding' state.
 */
const routeTicket = async (conversationId, io) => {
    try {
        const conversation = await Conversation.findById(conversationId).populate('business');
        if (!conversation) return;

        const ownerId = conversation.business.owner;
        if (!ownerId) return;

        // Find online agents who are NOT currently in a conversation (Free)
        const freeAgents = await User.find({
            ownerId: ownerId,
            role: 'agent',
            status: 'online',
        });

        if (freeAgents.length > 0) {
            // Pick the agent with the fewest active conversations (load balance)
            const selectedAgent = freeAgents[Math.floor(Math.random() * freeAgents.length)];

            conversation.assignedAgentId = selectedAgent._id;
            conversation.agent = selectedAgent._id;
            conversation.routingStatus = 'assigned';
            conversation.assignedAt = new Date();
            await conversation.save();

            // Notify the specific agent with full conversation payload
            const agentPayload = {
                ...conversation.toObject(),
                assignedAgentName: selectedAgent.displayName || selectedAgent.name,
            };
            io.to(`agent_${selectedAgent._id}`).emit('agent_assigned', agentPayload);

            // Also update the owner dashboard
            io.to(ownerId.toString()).emit('ticket_assigned', {
                conversationId: conversation._id,
                agentId: selectedAgent._id,
                agentName: selectedAgent.displayName || selectedAgent.name,
            });

            return selectedAgent;
        }

        // All agents are busy or offline — hold the ticket
        conversation.routingStatus = 'holding';
        await conversation.save();

        io.to(ownerId.toString()).emit('new_ticket_holding', {
            conversationId: conversation._id,
            reason: freeAgents.length === 0 ? 'All agents are Offline or Busy' : 'No free agents',
        });

        return null;
    } catch (error) {
        console.error('Routing error:', error);
    }
};

/**
 * When an agent comes online, check for any holding tickets and route them.
 */
const checkHoldingTickets = async (ownerId, io) => {
    try {
        const businessIds = await getBusinessIdsForOwner(ownerId);
        const holdingTickets = await Conversation.find({
            business: { $in: businessIds },
            routingStatus: 'holding',
        }).sort({ createdAt: 1 });

        for (const ticket of holdingTickets) {
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
