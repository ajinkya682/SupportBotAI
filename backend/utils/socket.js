const User = require('../models/User');
const Conversation = require('../models/Conversation');
const { routeTicket, checkHoldingTickets } = require('./routing');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        // ── Join Rooms ──────────────────────────────────────────────────────────
        socket.on('join_room', (data) => {
            if (typeof data === 'string') {
                socket.join(data);
                console.log(`Socket ${socket.id} joined shared room ${data}`);
            } else if (data && data.role) {
                const userId = data.userId || data.agentId;
                
                // 1. Private room for this specific user
                if (userId) {
                    socket.join(`user_${userId}`);
                    console.log(`User ${userId} joined private room user_${userId}`);
                }

                // 2. Role-based rooms for broadcasts
                if (data.role === 'superadmin') {
                    socket.join('role_superadmin');
                } else if (data.role === 'owner') {
                    socket.join('role_owner'); // All business owners
                    if (data.ownerId) {
                        socket.join(`owner_${data.ownerId}`);
                    }
                } else if (data.role === 'agent') {
                    if (data.ownerId) {
                        socket.join(`business_${data.ownerId}_agents`); // All agents of this business
                        socket.join(`owner_${data.ownerId}`); // Shared business room
                        socket.agentId = userId;
                        socket.ownerId = data.ownerId;
                    }
                    if (userId) {
                        socket.join(`agent_${userId}`);
                    }
                }
            }
        });

        // ── Widget joins its conversation-specific room ─────────────────────────
        socket.on('join_session', (sessionId) => {
            if (sessionId) {
                socket.join(`session_${sessionId}`);
                console.log(`Socket ${socket.id} joined session room session_${sessionId}`);
            }
        });

        // ── Agent Status Change ─────────────────────────────────────────────────
        socket.on('agent_status_change', async ({ agentId, status, ownerId }) => {
            try {
                if (agentId) {
                    const agent = await User.findById(agentId);
                    if (!agent) return;

                    agent.status = status;
                    agent.lastHeartbeat = new Date();
                    await agent.save();

                    // If agent was notified to go online, track the response
                    if (status === 'online' && agent.pendingGoOnlineRequest) {
                        const pushService = require('./pushService');
                        await pushService.sendNotification(ownerId, {
                            type: 'team',
                            title: `✅ ${agent.name} is now online`,
                            body: `${agent.name} came online after your notification. Tickets can now be assigned.`,
                            sound: 'success',
                            data: { url: '/dashboard/team' }
                        });
                        agent.pendingGoOnlineRequest = false;
                        await agent.save();
                    }

                    // Notify owner dashboard & all agents of this business
                    io.to(`owner_${ownerId}`).emit('agent_status_changed', { agentId, status });
                    
                    // If agent is in a conversation, notify that specific session room too
                    if (agent.currentConversationId) {
                        io.to(`session_${agent.currentConversationId}`).emit('agent_status_changed', { agentId, status });
                    }
                    
                    if (status === 'online' || status === 'away') {
                        await checkHoldingTickets(ownerId, io);
                    }
                }
            } catch (error) {
                console.error('Error updating agent status:', error);
            }
        });

        // ── Sound Triggers ──────────────────────────────────────────────────────
        socket.on('trigger_sound', ({ type, roomId }) => {
            if (roomId) {
                io.to(roomId).emit('play_sound', { type });
            }
        });

        // ── Agent Heartbeat ─────────────────────────────────────────────────────
        socket.on('agent_heartbeat', async ({ agentId }) => {
            try {
                if (agentId) {
                    await User.findByIdAndUpdate(agentId, { lastHeartbeat: new Date() });
                }
            } catch (error) {
                console.error('Heartbeat error:', error);
            }
        });

        // ── Typing Indicator ────────────────────────────────────────────────────
        socket.on('typing', ({ conversationId, agentName }) => {
            if (conversationId) {
                io.to(`session_${conversationId}`).emit('agent_typing', { conversationId, agentName });
            }
        });

        // ── Send Message (Agent/Owner → User) — Persist + Broadcast ────────────
        socket.on('send_message', async (data) => {
            const {
                conversationId,
                ownerId,
                content,
                senderType,
                senderName,
                senderAvatar,
                senderRole,
            } = data;

            console.log(`[send_message] from ${senderType} (${senderName}) for conv ${conversationId}`);

            const messagePayload = {
                conversationId: conversationId.toString(),
                content,
                senderType,
                senderName,
                senderAvatar: senderAvatar || null,
                senderRole: senderRole || null,
                timestamp: new Date(),
            };

            // Persist to DB
            try {
                const conversation = await Conversation.findById(conversationId);
                if (conversation) {
                    conversation.messages.push({
                        role: 'assistant',
                        content,
                        timestamp: messagePayload.timestamp,
                        senderType,
                        senderName,
                        senderAvatar: senderAvatar || null,
                        senderRole: senderRole || null,
                        sender: {
                            name: senderName,
                            profilePhoto: senderAvatar || null,
                            userType: senderType,
                        },
                    });
                    // Keep conversation in_progress
                    if (conversation.status !== 'in_progress') {
                        conversation.status = 'in_progress';
                    }
                    await conversation.save();
                }
            } catch (err) {
                console.error('send_message DB persist error:', err);
            }

            // Broadcast to all parties:
            // 1. Widget user (joined session room)
            io.to(`session_${conversationId}`).emit('new_message', messagePayload);
            
            // 1b. Send Push Notification to Customer if it's from agent/owner
            if (senderType === 'agent' || senderType === 'owner') {
                const conversation = await Conversation.findById(conversationId);
                if (conversation && conversation.origin) {
                    const pushService = require('./pushService');
                    await pushService.sendToSession(conversationId, {
                        type: 'message',
                        title: `Reply from ${senderName}`,
                        body: content.substring(0, 100),
                        data: { url: conversation.origin }
                    });
                }
            }

            // 2. Owner dashboard + all agents in owner room
            if (ownerId) {
                const room = `owner_${ownerId}`;
                io.to(room).emit('new_message', messagePayload);
                console.log(`[send_message] Broadcasted to room ${room}`);
            }
        });

        // ── Join Conversation via Socket (Legacy — prefer REST PUT /agents/join/:id) ──
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

                    const joinMessage = {
                        role: 'assistant',
                        content: `Hello! I've joined the chat. How can I help you today? 😊`,
                        timestamp: new Date(),
                        senderType: 'agent',
                        senderName: agent.displayName || agent.name,
                        senderAvatar: agent.profilePhoto || null,
                        senderRole: agent.roleTitle || 'Support Agent',
                        sender: {
                            name: agent.displayName || agent.name,
                            profilePhoto: agent.profilePhoto || null,
                            userType: 'agent',
                        },
                    };
                    conversation.messages.push(joinMessage);
                    await conversation.save();

                    const agentDetails = {
                        _id: agent._id,
                        displayName: agent.displayName || agent.name,
                        roleTitle: agent.roleTitle || 'Support Agent',
                        profilePhoto: agent.profilePhoto || null,
                    };

                    const payload = {
                        conversationId,
                        agent: agentDetails,
                        status: 'in_progress',
                        messages: conversation.messages,
                        joinMessage,
                    };

                    // Emit to widget session room
                    io.to(`session_${conversationId}`).emit('agent_joined', payload);

                    // Send Push Notification to Customer
                    const pushService = require('./pushService');
                    if (conversation.origin) {
                        await pushService.sendToSession(conversationId, {
                            type: 'message',
                            title: 'Human Agent Joined',
                            body: `${agent.displayName || agent.name} has joined the chat to help you.`,
                            data: { url: conversation.origin }
                        });
                    }

                    // Emit to owner dashboard + all agents
                    if (ownerId) {
                        io.to(`owner_${ownerId}`).emit('agent_joined', payload);
                        io.to(`owner_${ownerId}`).emit('agent_status_changed', { agentId, status: 'in_conversation' });
                        io.to(`owner_${ownerId}`).emit('conversation_claimed', { conversationId, agentId });
                    }
                }
            } catch (error) {
                console.error('Join conversation error:', error);
            }
        });

        // ── Resolve Ticket ──────────────────────────────────────────────────────
        socket.on('resolve_ticket', async (data) => {
            const { conversationId, resolvedBy, resolvedByName, resolvedByType } = data;
            let { ownerId } = data;
            try {
                const conversation = await Conversation.findById(conversationId).populate('business');
                if (conversation) {
                    // Fallback to business owner if ownerId is missing
                    if (!ownerId && conversation.business) {
                        ownerId = conversation.business.owner;
                    }

                    conversation.status = 'human_resolved';
                    conversation.routingStatus = 'resolved';
                    conversation.resolvedBy = resolvedBy;
                    conversation.resolvedByName = resolvedByName;
                    conversation.resolvedByType = resolvedByType;
                    conversation.resolvedAt = new Date();
                    conversation.updatedAt = new Date();
                    await conversation.save();

                    if (resolvedByType === 'agent' && resolvedBy) {
                        const agent = await User.findById(resolvedBy);
                        if (agent) {
                            agent.status = 'online';
                            agent.currentConversationId = null;
                            await agent.save();
                            if (ownerId) {
                                io.to(`owner_${ownerId}`).emit('agent_status_changed', { agentId: resolvedBy, status: 'online' });
                                await checkHoldingTickets(ownerId, io);
                            }
                        }
                    }

                    const resolverName = resolvedByName || (resolvedByType === 'user' ? 'Customer' : 'Support');
                    const systemMsg = {
                        role: 'assistant',
                        content: `✅ Conversation marked as solved by ${resolvedByType === 'user' ? 'the customer' : resolvedByType === 'agent' ? `Agent ${resolverName}` : 'Business Owner'}. Feel free to ask anything else.`,
                        timestamp: new Date(),
                        senderType: 'ai',
                        senderName: 'System',
                        senderRole: 'system'
                    };
                    conversation.messages.push(systemMsg);
                    await conversation.save();

                    const payload = {
                        conversationId: conversation._id.toString(),
                        resolvedBy,
                        resolvedByName: resolverName,
                        resolvedByType,
                        resolvedAt: conversation.resolvedAt,
                        updatedAt: conversation.updatedAt,
                        status: 'human_resolved',
                        messages: conversation.messages,
                    };

                    // 1. Notify Widget Session (all tabs)
                    io.to(`session_${conversationId.toString()}`).emit('ticket_resolved', payload);
                    
                    // 2. Notify Dashboard (Owner/Agents)
                    if (ownerId) {
                        const room = `owner_${ownerId}`;
                        io.to(room).emit('ticket_resolved', payload);
                        // Standardize on update_conversation for list updates
                        io.to(room).emit('update_conversation', conversation);
                    }

                    console.log(`[Socket] Ticket ${conversationId} resolved by ${resolvedByType}. Broadcast sent to owner ${ownerId}`);
                }
            } catch (error) {
                console.error('[Socket] Resolve ticket error:', error);
            }
        });

        // ── Toggle AI ───────────────────────────────────────────────────────────
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
                    io.to(`session_${conversationId}`).emit('ai_toggled', payload);
                    if (ownerId) io.to(`owner_${ownerId}`).emit('ai_toggled', payload);
                }
            } catch (error) {
                console.error('Toggle AI error:', error);
            }
        });

        // ── Auto-Offline Stale Agents ───────────────────────────────────────────
        setInterval(async () => {
            try {
                const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000);
                const staleAgents = await User.find({
                    role: 'agent',
                    status: { $ne: 'offline' },
                    lastHeartbeat: { $lt: twoMinsAgo }
                });

                for (const agent of staleAgents) {
                    agent.status = 'offline';
                    await agent.save();
                    if (agent.ownerId) {
                        io.to(`owner_${agent.ownerId}`).emit('agent_status_changed', { 
                            agentId: agent._id, 
                            status: 'offline' 
                        });
                    }
                    console.log(`Agent ${agent._id} auto-offline (stale heartbeat)`);
                }
            } catch (err) {
                console.error('Auto-offline check error:', err);
            }
        }, 60000); // Check every minute

        // ── Disconnect ──────────────────────────────────────────────────────────
        socket.on('disconnect', async () => {
            console.log('Client disconnected:', socket.id);
            
            // Find if this socket belonged to an agent
            // We can check rooms or use a map. For simplicity, let's look for agents
            // who might have just disconnected.
            
            // To be more robust, we should have stored agentId on the socket object
            // when they joined. Let's assume we do that now in join_room.
            
            if (socket.agentId && socket.ownerId) {
                const agentId = socket.agentId;
                const ownerId = socket.ownerId;

                // Give it a small delay to see if they reconnect (e.g. refresh)
                setTimeout(async () => {
                    const activeSockets = await io.in(`agent_${agentId}`).fetchSockets();
                    if (activeSockets.length === 0) {
                        try {
                            const agent = await User.findById(agentId);
                            if (agent && agent.status !== 'offline') {
                                agent.status = 'offline';
                                await agent.save();
                                
                                // Notify owner dashboard
                                io.to(`owner_${ownerId}`).emit('agent_status_changed', { 
                                    agentId, 
                                    status: 'offline' 
                                });
                                console.log(`Agent ${agentId} set to offline after disconnect`);
                            }
                        } catch (err) {
                            console.error('Error setting agent offline on disconnect:', err);
                        }
                    }
                }, 5000); // 5 second grace period for refreshes
            }
        });
    });
};
