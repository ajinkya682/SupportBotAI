import User from '../models/user.model.js';
import Conversation from '../models/conversation.model.js';
import { routeTicket, checkHoldingTickets } from './routing.js';

export default (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        // Join rooms based on identity
        socket.on('join_room', (data) => {
            if (typeof data === 'string') {
                socket.join(data);
                console.log(`Socket ${socket.id} joined shared room ${data}`);
            } else if (data && data.ownerId) {
                socket.join(data.ownerId.toString());
                if (data.role === 'owner') {
                    socket.join(`owner_${data.ownerId}`);
                } else if (data.role === 'agent' && data.userId) {
                    socket.join(`agent_${data.userId}`);
                }
                console.log(`Socket ${socket.id} joined rooms for owner ${data.ownerId}`);
            }
        });

        // Chatbot joins session room
        socket.on('join_session', (sessionId) => {
            if (sessionId) {
                socket.join(`session_${sessionId}`);
                console.log(`Socket ${socket.id} joined session room session_${sessionId}`);
            }
        });

        // Agent Status System
        socket.on('agent_status_change', async ({ agentId, status, ownerId }) => {
            try {
                if (agentId) {
                    const agent = await User.findById(agentId);
                    if (!agent) return;

                    agent.status = status;
                    agent.lastHeartbeat = new Date();
                    await agent.save();

                    io.to(ownerId.toString()).emit('agent_status_changed', { agentId, status });

                    if (status === 'online') {
                        await checkHoldingTickets(ownerId, io);
                    }
                }
            } catch (error) {
                console.error("Error updating agent status:", error);
            }
        });

        socket.on('agent_heartbeat', async ({ agentId }) => {
            try {
                if (agentId) {
                    await User.findByIdAndUpdate(agentId, { lastHeartbeat: new Date() });
                }
            } catch (error) {
                console.error("Heartbeat error:", error);
            }
        });

        // Real-time Messages
        socket.on('send_message', async (data) => {
            const { conversationId, ownerId, content, senderType, senderName, senderAvatar, senderRole } = data;
            
            const messagePayload = {
                conversationId,
                content,
                senderType,
                senderName,
                senderAvatar,
                senderRole,
                timestamp: new Date()
            };

            io.to(`session_${conversationId}`).emit('new_message', messagePayload);
            if (ownerId) io.to(ownerId.toString()).emit('new_message', messagePayload);
        });

        // Agent Joins Conversation
        socket.on('join_conversation', async ({ conversationId, agentId, ownerId }) => {
            try {
                const conversation = await Conversation.findById(conversationId);
                const agent = await User.findById(agentId);

                if (conversation && agent) {
                    conversation.agent = agentId;
                    conversation.assignedAgentId = agentId;
                    conversation.status = 'in_progress';
                    conversation.routingStatus = 'in_progress';
                    conversation.isAiActive = false;
                    await conversation.save();

                    agent.status = 'in_conversation';
                    agent.currentConversationId = conversationId;
                    await agent.save();

                    const systemMsg = {
                        role: 'assistant',
                        content: `👤 Support Agent ${agent.displayName || agent.name} has joined the conversation.`,
                        timestamp: new Date(),
                        senderType: 'ai',
                        senderName: 'System',
                    };
                    conversation.messages.push(systemMsg);
                    await conversation.save();

                    const payload = { 
                        conversationId, 
                        agent: { _id: agent._id, displayName: agent.displayName, profilePhoto: agent.profilePhoto }, 
                        status: 'in_progress',
                        messages: conversation.messages
                    };
                    
                    io.to(`session_${conversationId}`).emit('agent_joined', payload);
                    if (ownerId) io.to(ownerId.toString()).emit('agent_joined', payload);
                    if (ownerId) io.to(ownerId.toString()).emit('agent_status_changed', { agentId, status: 'in_conversation' });
                    if (ownerId) io.to(ownerId.toString()).emit('conversation_claimed', { conversationId, agentId });
                }
            } catch (error) {
                console.error("Join conversation error:", error);
            }
        });

        // Ticket Resolved
        socket.on('resolve_ticket', async (data) => {
            const { conversationId, ownerId, resolvedBy, resolvedByName, resolvedByType } = data;
            try {
                const conversation = await Conversation.findById(conversationId);
                if (conversation) {
                    conversation.status = 'human_resolved';
                    conversation.routingStatus = 'resolved';
                    conversation.resolvedBy = resolvedBy;
                    conversation.resolvedByName = resolvedByName;
                    conversation.resolvedByType = resolvedByType;
                    conversation.resolvedAt = new Date();
                    conversation.updatedAt = new Date();
                    await conversation.save();

                    if (resolvedByType === 'agent') {
                        const agent = await User.findById(resolvedBy);
                        if (agent) {
                            agent.status = 'online';
                            agent.currentConversationId = null;
                            await agent.save();
                            if (ownerId) io.to(ownerId.toString()).emit('agent_status_changed', { agentId: resolvedBy, status: 'online' });
                            if (ownerId) await checkHoldingTickets(ownerId, io);
                        }
                    }

                    const resolverName = resolvedByName || 'Support';
                    const systemMsg = {
                        role: 'assistant',
                        content: `✅ Conversation marked as solved by ${resolvedByType === 'agent' ? `Agent ${resolverName}` : 'Business Owner'}.`,
                        timestamp: new Date(),
                        senderType: 'ai',
                        senderName: 'System',
                    };
                    conversation.messages.push(systemMsg);
                    await conversation.save();

                    const payload = { 
                        conversationId, 
                        resolvedBy, 
                        resolvedByName: resolverName, 
                        resolvedByType, 
                        resolvedAt: conversation.resolvedAt,
                        updatedAt: conversation.updatedAt,
                        status: 'human_resolved',
                        messages: conversation.messages
                    };
                    io.to(`session_${conversationId}`).emit('ticket_resolved', payload);
                    if (ownerId) io.to(ownerId.toString()).emit('ticket_resolved', payload);
                }
            } catch (error) {
                console.error("Resolve ticket error:", error);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};
