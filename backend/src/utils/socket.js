import User from '../models/user.model.js';
import Conversation from '../models/conversation.model.js';
import { checkHoldingTickets } from './routing.js';

export default (io) => {
    io.on('connection', (socket) => {
        console.log('🔌 New client connected:', socket.id);

        
        const emitToContext = (conversationId, ownerId, event, payload) => {
            if (conversationId) io.to(`session:${conversationId}`).emit(event, payload);
            if (ownerId) io.to(`owner:${ownerId.toString()}`).emit(event, payload);
        };

        socket.on('join_room', (data, callback) => {
            try {
                if (typeof data === 'string') {
                    socket.join(data); 
                } else if (data?.ownerId) {
                    const ownerRoom = `owner:${data.ownerId.toString()}`;
                    socket.join(ownerRoom);

                    if (data.role === 'owner') {
                        socket.join(`owner_role:${data.ownerId.toString()}`);
                    } else if (data.role === 'agent' && data.userId) {
                        socket.join(`agent:${data.userId.toString()}`);
                    }
                    
                    callback?.({ success: true, message: 'Joined room successfully' });
                } else {
                    callback?.({ success: false, error: 'Invalid room data' });
                }
            } catch (error) {
                console.error('Join room error:', error);
                callback?.({ success: false, error: 'Failed to join room' });
            }
        });

        socket.on('join_session', (sessionId, callback) => {
            try {
                if (!sessionId) {
                    return callback?.({ success: false, error: 'Session ID required' });
                }
                socket.join(`session:${sessionId}`);
                callback?.({ success: true, message: 'Joined session' });
            } catch (error) {
                console.error('Join session error:', error);
                callback?.({ success: false, error: 'Failed to join session' });
            }
        });

        socket.on('agent_status_change', async ({ agentId, status, ownerId }, callback) => {
            try {
                if (!agentId || !status) {
                    return callback?.({ success: false, error: 'agentId and status required' });
                }

                const validStatuses = ['online', 'away', 'in_conversation', 'offline'];
                if (!validStatuses.includes(status)) {
                    return callback?.({ success: false, error: 'Invalid status' });
                }

                const agent = await User.findByIdAndUpdate(
                    agentId, 
                    { status, lastHeartbeat: new Date() }, 
                    { new: true }
                ).select('_id status').lean();

                if (!agent) {
                    return callback?.({ success: false, error: 'Agent not found' });
                }

                if (ownerId) {
                    io.to(`owner:${ownerId.toString()}`).emit('agent_status_changed', { 
                        agentId, 
                        status, 
                        timestamp: new Date() 
                    });

                    if (status === 'online') {
                        await checkHoldingTickets(ownerId, io);
                    }
                }

                callback?.({ success: true, data: { agentId, status } });
            } catch (error) {
                console.error("❌ Agent Status Error:", error);
                callback?.({ success: false, error: 'Server error updating status' });
            }
        });

        socket.on('agent_heartbeat', async ({ agentId }, callback) => {
            try {
                if (!agentId) {
                    return callback?.({ success: false, error: 'agentId required' });
                }

                await User.findByIdAndUpdate(agentId, { lastHeartbeat: new Date() });
                callback?.({ success: true });
            } catch (error) {
                console.error("❌ Heartbeat error:", error);
                callback?.({ success: false, error: 'Heartbeat update failed' });
            }
        });

        socket.on('send_message', async (data, callback) => {
            try {
                if (!data?.conversationId) {
                    return callback?.({ success: false, error: 'conversationId required' });
                }

                const { conversationId, ownerId, ...msgDetails } = data;
                const messagePayload = { ...msgDetails, timestamp: new Date(), conversationId };

                emitToContext(conversationId, ownerId, 'new_message', messagePayload);
                callback?.({ success: true });
            } catch (error) {
                console.error("❌ Send message error:", error);
                callback?.({ success: false, error: 'Failed to send message' });
            }
        });

        socket.on('join_conversation', async ({ conversationId, agentId, ownerId }, callback) => {
            try {
                if (!conversationId || !agentId) {
                    return callback?.({ success: false, error: 'conversationId and agentId required' });
                }

                const [conversation, agent] = await Promise.all([
                    Conversation.findById(conversationId),
                    User.findById(agentId)
                ]);

                if (!conversation) {
                    return callback?.({ success: false, error: 'Conversation not found' });
                }

                if (!agent) {
                    return callback?.({ success: false, error: 'Agent not found' });
                }

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
                    io.to(`owner:${ownerId.toString()}`).emit('agent_status_changed', { agentId, status: 'in_conversation' });
                    io.to(`owner:${ownerId.toString()}`).emit('conversation_claimed', { conversationId, agentId });
                }

                callback?.({ success: true, data: payload });
            } catch (error) {
                console.error("❌ Join Conversation Error:", error);
                callback?.({ success: false, error: 'Failed to join conversation' });
            }
        });

        socket.on('resolve_ticket', async (data, callback) => {
            const { conversationId, ownerId, resolvedBy, resolvedByName, resolvedByType } = data;
            try {
                if (!conversationId) {
                    return callback?.({ success: false, error: 'conversationId required' });
                }

                const conversation = await Conversation.findById(conversationId);
                if (!conversation) {
                    return callback?.({ success: false, error: 'Conversation not found' });
                }

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
                        io.to(`owner:${ownerId.toString()}`).emit('agent_status_changed', { agentId: resolvedBy, status: 'online' });
                        await checkHoldingTickets(ownerId, io);
                    }
                }

                const payload = { ...data, status: 'human_resolved', messages: conversation.messages };
                emitToContext(conversationId, ownerId, 'ticket_resolved', payload);
                callback?.({ success: true, data: payload });
            } catch (error) {
                console.error("❌ Resolve Ticket Error:", error);
                callback?.({ success: false, error: 'Failed to resolve ticket' });
            }
        });

        socket.on('toggle_ai', async ({ conversationId, isAiActive, ownerId }, callback) => {
            try {
                if (!conversationId) {
                    return callback?.({ success: false, error: 'conversationId required' });
                }

                const conversation = await Conversation.findById(conversationId);
                if (!conversation) {
                    return callback?.({ success: false, error: 'Conversation not found' });
                }

                conversation.isAiActive = isAiActive;
                if (isAiActive && conversation.status === 'in_progress') {
                    conversation.status = 'ai_resolved';
                }
                await conversation.save();

                const payload = { conversationId, isAiActive, status: conversation.status };
                emitToContext(conversationId, ownerId, 'ai_toggled', payload);
                callback?.({ success: true, data: payload });
            } catch (error) {
                console.error("❌ Toggle AI Error:", error);
                callback?.({ success: false, error: 'Failed to toggle AI' });
            }
        });

        socket.on('disconnect', () => {
            console.log('🔌 Client disconnected:', socket.id);
        });
    });
};