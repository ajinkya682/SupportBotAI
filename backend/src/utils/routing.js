import User from '../models/user.model.js';
import Conversation from '../models/conversation.model.js';
import Business from '../models/business.model.js';

/**
 * Smart Routing Logic
 * Routes a ticket to the best available agent or places it in holding.
 */
export const routeTicket = async (conversationId, io) => {
    try {
        const conversation = await Conversation.findById(conversationId).populate('business');
        if (!conversation) return;

        const ownerId = conversation.business.owner;
        if (!ownerId) return;

        // Step 1: Query available agents (Online)
        const onlineAgents = await User.find({
            ownerId: ownerId,
            role: 'agent',
            status: 'online'
        });

        // Step 2: If online agents exist
        if (onlineAgents.length > 0) {
            let selectedAgent;
            if (onlineAgents.length === 1) {
                selectedAgent = onlineAgents[0];
            } else {
                // Pick randomly from the pool for now
                selectedAgent = onlineAgents[Math.floor(Math.random() * onlineAgents.length)];
            }

            conversation.assignedAgentId = selectedAgent._id;
            conversation.agent = selectedAgent._id; // legacy field
            conversation.routingStatus = 'assigned';
            conversation.assignedAt = new Date();
            await conversation.save();

            // Emit to specific agent room and owner room
            if (io) {
                io.to(`agent_${selectedAgent._id}`).emit('agent_assigned', conversation);
                io.to(ownerId.toString()).emit('new_ticket', conversation);
            }
            
            return selectedAgent;
        }

        // Step 3: If no Online agents but Away agents exist
        const awayAgents = await User.find({
            ownerId: ownerId,
            role: 'agent',
            status: 'away'
        });

        if (awayAgents.length > 0) {
            conversation.routingStatus = 'holding';
            await conversation.save();
            if (io) {
                io.to(ownerId.toString()).emit('new_ticket_holding', {
                    conversationId: conversation._id,
                    reason: 'Agents are Away'
                });
            }
            return null;
        }

        // Step 4: All agents Offline
        conversation.routingStatus = 'holding';
        await conversation.save();
        if (io) {
            io.to(ownerId.toString()).emit('new_ticket_holding', {
                conversationId: conversation._id,
                reason: 'All agents are Offline'
            });
        }
        
        return null;
    } catch (error) {
        console.error("Routing error:", error);
    }
};

/**
 * Check for holding tickets when an agent becomes available
 */
export const checkHoldingTickets = async (ownerId, io) => {
    try {
        const businesses = await Business.find({ owner: ownerId });
        const businessIds = businesses.map(b => b._id);
        
        const holdingTicket = await Conversation.findOne({
            business: { $in: businessIds },
            routingStatus: 'holding'
        }).sort({ createdAt: 1 });

        if (holdingTicket) {
            await routeTicket(holdingTicket._id, io);
        }
    } catch (error) {
        console.error("Check holding tickets error:", error);
    }
};
