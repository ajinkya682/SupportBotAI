import User from '../models/user.model.js';
import Conversation from '../models/conversation.model.js';
import { checkHoldingTickets } from './routing.js';

export default (io) => {
    io.on('connection', (socket) => {
        console.log('🔌 New client connected:', socket.id);

        const emitToContext = (conversationId, ownerId, event, payload) => {
            if (conversationId) io.to(`session_${conversationId}`).emit(event, payload);
            if (ownerId) io.to(ownerId.toString()).emit(event, payload);
        };

        socket.on('join_room', (data) => {
            if (typeof data === 'string') {
                socket.join(data); // Legacy support
            } else if (data?.ownerId) {
                const ownerRoom = data.ownerId.toString();
                socket.join(ownerRoom);

                if (data.role === 'owner') {
                    socket.join(`owner_${ownerRoom}`);
                } else if (data.role === 'agent' && data.userId) {
                    socket.join(`agent_${data.userId}`);
                }
            }
        });

        socket.on('join_session', (sessionId) => {
            if (sessionId) socket.join(`session_${sessionId}`);
        });

        socket.on('agent_status_change', async ({ agentId, status, ownerId }) => {
            try {
                if (!agentId) return;

                const agent = await User.findByIdAndUpdate(
                    agentId, 
                    { status, lastHeartbeat: new Date() }, 
                    { new: true }
                );

                if (agent && ownerId) {
                    io.to(ownerId.toString()).emit('agent_status_changed', { agentId, status });

                    if (status === 'online') {
                        await checkHoldingTickets(ownerId, io);
                    }
                }
            } catch (error) {
                console.error("Agent Status Error:", error);
            }
        });

        socket.on('agent_heartbeat', async ({ agentId }) => {
            if (agentId) {
                await User.findByIdAndUpdate(agentId, { lastHeartbeat: new Date() }).catch(err => 
                    console.error("Heartbeat error:", err)
                );
            }
        });

        socket.on('send_message', async (data) => {
            const { conversationId, ownerId, ...msgDetails } = data;
            const messagePayload = { ...msgDetails, timestamp: new Date(), conversationId };

            emitToContext(conversationId, ownerId, 'new_message', messagePayload);
        });

        socket.on('join_conversation', async ({ conversationId, agentId, ownerId }) => {
            try {
                const [conversation, agent] = await Promise.all([
                    Conversation.findById(conversationId),
                    User.findById(agentId)
                ]);

                if (conversation && agent) {
                    
                    conversation.assignedAgentId = agentId;
                    conversation.status = 'in_progress';
                    conversation.routingStatus = 'in_progress';
                    conversation.isAiActive = false;

                    const systemMsg = {
                        role: 'assistant',
                        content: `👤 Support Agent ${agent.displayName || agent.name} joined.`,
                        timestamp: new Date(),
                        senderType: 'ai',
                        senderName: 'System',
                    };
                    conversation.messages.push(systemMsg);
                    await conversation.save();

                    agent.status = 'in_conversation';
                    agent.currentConversationId = conversationId;
                    await agent.save();

                    const payload = { 
                        conversationId, 
                        agent: { _id: agent._id, displayName: agent.displayName, profilePhoto: agent.profilePhoto }, 
                        status: 'in_progress',
                        messages: conversation.messages
                    };
                    
                    emitToContext(conversationId, ownerId, 'agent_joined', payload);
                    if (ownerId) {
                        io.to(ownerId.toString()).emit('agent_status_changed', { agentId, status: 'in_conversation' });
                        io.to(ownerId.toString()).emit('conversation_claimed', { conversationId, agentId });
                    }
                }
            } catch (error) {
                console.error("Join Conversation Error:", error);
            }
        });

        socket.on('resolve_ticket', async (data) => {
            const { conversationId, ownerId, resolvedBy, resolvedByName, resolvedByType } = data;
            try {
                const conversation = await Conversation.findById(conversationId);
                if (!conversation) return;

                conversation.status = 'human_resolved';
                conversation.routingStatus = 'resolved';
                conversation.resolvedBy = resolvedBy;
                conversation.resolvedByName = resolvedByName || 'Support';
                conversation.resolvedByType = resolvedByType;
                conversation.resolvedAt = new Date();
                
                const systemMsg = {
                    role: 'assistant',
                    content: `✅ Solved by ${resolvedByType === 'agent' ? `Agent ${resolvedByName}` : 'Business Owner'}.`,
                    timestamp: new Date(),
                    senderType: 'ai',
                    senderName: 'System',
                };
                conversation.messages.push(systemMsg);
                await conversation.save();

                if (resolvedByType === 'agent') {
                    await User.findByIdAndUpdate(resolvedBy, { 
                        status: 'online', 
                        currentConversationId: null 
                    });
                    if (ownerId) {
                        io.to(ownerId.toString()).emit('agent_status_changed', { agentId: resolvedBy, status: 'online' });
                        await checkHoldingTickets(ownerId, io);
                    }
                }

                const payload = { ...data, status: 'human_resolved', messages: conversation.messages };
                emitToContext(conversationId, ownerId, 'ticket_resolved', payload);
            } catch (error) {
                console.error("Resolve Ticket Error:", error);
            }
        });

        socket.on('toggle_ai', async ({ conversationId, isAiActive, ownerId }) => {
            try {
                const conversation = await Conversation.findById(conversationId);
                if (conversation) {
                    conversation.isAiActive = isAiActive;
                    if (isAiActive && conversation.status === 'in_progress') {
                        conversation.status = 'ai_resolved';
                    }
                    await conversation.save();

                    const payload = { conversationId, isAiActive, status: conversation.status };
                    emitToContext(conversationId, ownerId, 'ai_toggled', payload);
                }
            } catch (error) {
                console.error("Toggle AI Error:", error);
            }
        });

        socket.on('disconnect', () => {
            console.log('🔌 Client disconnected:', socket.id);
        });
    });
};