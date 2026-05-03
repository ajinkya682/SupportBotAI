import User from '../models/user.model.js';
import Conversation from '../models/conversation.model.js';
import Business from '../models/business.model.js';

/**
 * Smart Routing Logic
 * Routes a ticket to the best available agent or places it in holding.
 * Optimized for horizontal scaling and multi-tenant isolation.
 */
export const routeTicket = async (conversationId, io) => {
    try {
        const conversation = await Conversation.findById(conversationId)
            .populate({
                path: 'business',
                select: 'owner'
            });

        if (!conversation || !conversation.business?.owner) return null;

        const ownerId = conversation.business.owner;

        const onlineAgents = await User.find({
            ownerId,
            role: 'agent',
            status: 'online'
        }).select('_id name').lean();

        if (onlineAgents.length > 0) {
            const selectedAgent = onlineAgents.length === 1 
                ? onlineAgents[0] 
                : onlineAgents[Math.floor(Math.random() * onlineAgents.length)];

            conversation.assignedAgentId = selectedAgent._id;
            conversation.agent = selectedAgent._id; 
            conversation.routingStatus = 'assigned';
            conversation.assignedAt = new Date();
            await conversation.save();

            io.to(`agent_${selectedAgent._id}`).emit('agent_assigned', conversation);
            io.to(ownerId.toString()).emit('new_ticket', conversation);
            
            return selectedAgent;
        }

        const awayAgentsCount = await User.countDocuments({
            ownerId,
            role: 'agent',
            status: 'away'
        });

        conversation.routingStatus = 'holding';
        await conversation.save();

        const reason = awayAgentsCount > 0 ? 'Agents are Away' : 'All agents are Offline';
        
        io.to(ownerId.toString()).emit('new_ticket_holding', {
            conversationId: conversation._id,
            reason
        });
        
        return null;
    } catch (error) {
        console.error("Routing error:", error);
        return null;
    }
};

/**
 * Check for holding tickets when an agent becomes available
 * Ensures the oldest tickets are handled first (FIFO).
 */
export const checkHoldingTickets = async (ownerId, io) => {
    try {
        const businessIds = await Business.find({ owner: ownerId }).distinct('_id').lean();

        const holdingTicket = await Conversation.findOne({
            business: { $in: businessIds },
            routingStatus: 'holding'
        }).sort({ createdAt: 1 }).select('_id');

        if (holdingTicket) {
            await routeTicket(holdingTicket._id, io);
        }
    } catch (error) {
        console.error("Check holding tickets error:", error);
    }
};