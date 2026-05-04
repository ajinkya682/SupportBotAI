const User = require('../models/User');
const Conversation = require('../models/Conversation');

const routeTicket = async (conversationId, io) => {
    try {
        const conversation = await Conversation.findById(conversationId).populate('business');
        if (!conversation) return;

        const ownerId = conversation.business.owner;
        if (!ownerId) return;

        const onlineAgents = await User.find({
            ownerId: ownerId,
            role: 'agent',
            status: 'online'
        });

        if (onlineAgents.length > 0) {
            const selectedAgent = onlineAgents[Math.floor(Math.random() * onlineAgents.length)];

            conversation.assignedAgentId = selectedAgent._id;
            conversation.agent = selectedAgent._id;
            conversation.routingStatus = 'assigned';
            conversation.assignedAt = new Date();
            await conversation.save();

            io.to(`agent_${selectedAgent._id}`).emit('agent_assigned', conversation);
            io.to(ownerId.toString()).emit('new_ticket', conversation);
            
            return selectedAgent;
        }

        const awayAgents = await User.find({
            ownerId: ownerId,
            role: 'agent',
            status: 'away'
        });

        if (awayAgents.length > 0) {
            conversation.routingStatus = 'holding';
            await conversation.save();
            io.to(ownerId.toString()).emit('new_ticket_holding', {
                conversationId: conversation._id,
                reason: 'Agents are Away'
            });
            return null;
        }

        conversation.routingStatus = 'holding';
        await conversation.save();
        io.to(ownerId.toString()).emit('new_ticket_holding', {
            conversationId: conversation._id,
            reason: 'All agents are Offline'
        });
        
        return null;
    } catch (error) {
        console.error("Routing error:", error);
    }
};

const checkHoldingTickets = async (ownerId, io) => {
    try {
        const holdingTicket = await Conversation.findOne({
            business: { $in: await getBusinessIdsForOwner(ownerId) },
            routingStatus: 'holding'
        }).sort({ createdAt: 1 });

        if (holdingTicket) {
            await routeTicket(holdingTicket._id, io);
        }
    } catch (error) {
        console.error("Check holding tickets error:", error);
    }
};

async function getBusinessIdsForOwner(ownerId) {
    const Business = require('../models/Business');
    const businesses = await Business.find({ owner: ownerId });
    return businesses.map(b => b._id);
}

module.exports = { routeTicket, checkHoldingTickets };
