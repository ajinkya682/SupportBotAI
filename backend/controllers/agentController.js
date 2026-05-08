const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Business = require('../models/Business');
const bcrypt = require('bcryptjs');
const imagekit = require('../utils/imagekit');
const multer = require('multer');

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
}).single('photo');

const sendEmail = require('../utils/email');

// Business Owner: Add a new agent
exports.addAgent = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const agent = await User.create({
            name,
            email,
            password,
            role: 'agent',
            roleTitle: req.body.roleTitle || 'Support Agent',
            ownerId: req.user._id,
            status: 'online'
        });

        // ── SEND WELCOME EMAIL TO AGENT ───────────────────────────────────────
        try {
            const business = await Business.findOne({ owner: req.user._id });
            await sendEmail({
                email: agent.email,
                type: 'welcomeAgent',
                data: { 
                    name: agent.name, 
                    ownerName: req.user.name, 
                    businessName: business?.name || 'the company',
                    password: password // Temporary password sent for first login
                }
            });
        } catch (err) {
            console.error('Failed to send agent welcome email:', err.message);
        }

        res.status(201).json({
            message: 'Agent created successfully',
            agent: {
                _id: agent._id,
                name: agent.name,
                email: agent.email,
                role: agent.role,
                status: agent.status
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Business Owner: List all agents
exports.listAgents = async (req, res) => {
    try {
        const agents = await User.find({ ownerId: req.user._id, role: 'agent' }).select('-password').lean();
        const business = await Business.findOne({ owner: req.user._id });
        
        if (business) {
            for (let agent of agents) {
                const handledToday = await Conversation.countDocuments({
                    business: business._id,
                    agent: agent._id,
                    updatedAt: { $gte: new Date().setHours(0, 0, 0, 0) }
                });
                const resolved = await Conversation.countDocuments({
                    business: business._id,
                    agent: agent._id,
                    status: 'human_resolved'
                });
                agent.stats = { handledToday, resolved };
            }
        }
        res.json(agents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Business Owner: Delete an agent
exports.deleteAgent = async (req, res) => {
    try {
        const agent = await User.findOne({ _id: req.params.id, ownerId: req.user._id });
        if (!agent) {
            return res.status(404).json({ message: 'Agent not found' });
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Agent deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Agent: Profile Setup / Update
exports.updateProfile = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        const { displayName, roleTitle } = req.body;

        try {
            const agent = await User.findById(req.user._id);
            if (!agent) return res.status(404).json({ message: 'Agent not found' });

            if (req.file) {
                const hasImageKit =
                    process.env.IMAGEKIT_PRIVATE_KEY &&
                    process.env.IMAGEKIT_PRIVATE_KEY !== 'your_private_api_key' &&
                    process.env.IMAGEKIT_PRIVATE_KEY.length > 10;

                if (hasImageKit) {
                    // v7 SDK: imagekit.files.upload(body)
                    const base64File = req.file.buffer.toString('base64');
                    const result = await imagekit.files.upload({
                        file: base64File,
                        fileName: `agent-${agent._id}-${Date.now()}`,
                        folder: '/agent-profiles',
                    });
                    agent.profilePhoto = result.url;
                } else {
                    // Local dev fallback: store as base64 data URL
                    const mimeType = req.file.mimetype;
                    const base64 = req.file.buffer.toString('base64');
                    agent.profilePhoto = `data:${mimeType};base64,${base64}`;
                }
            }

            if (displayName) agent.displayName = displayName;
            if (roleTitle) agent.roleTitle = roleTitle;

            await agent.save();

            res.json({
                message: 'Profile updated successfully',
                agent: {
                    _id: agent._id,
                    displayName: agent.displayName,
                    roleTitle: agent.roleTitle,
                    profilePhoto: agent.profilePhoto,
                    status: agent.status,
                },
            });
        } catch (error) {
            console.error('updateProfile error:', error.message);
            res.status(500).json({ message: error.message });
        }
    });
};

// Agent: Update Availability
exports.updateAvailability = async (req, res) => {
    const { availability } = req.body;
    try {
        const agent = await User.findByIdAndUpdate(
            req.user._id,
            { availability },
            { new: true }
        );
        res.json({ availability: agent.availability });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Agent: Get Dashboard Stats
exports.getAgentStats = async (req, res) => {
    try {
        const ownerId = req.user.role === 'agent' ? req.user.ownerId : req.user._id;
        const business = await Business.findOne({ owner: ownerId });
        if (!business) return res.status(404).json({ message: 'Business not found' });

        const handledToday = await Conversation.countDocuments({
            business: business._id,
            agent: req.user._id,
            updatedAt: { $gte: new Date().setHours(0, 0, 0, 0) }
        });

        const resolved = await Conversation.countDocuments({
            business: business._id,
            agent: req.user._id,
            status: 'human_resolved'
        });

        const pending = await Conversation.countDocuments({
            business: business._id,
            status: 'human_needed',
            agent: { $exists: false }
        });

        res.json({ handledToday, resolved, pending });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Agent: Join Live Conversation — atomic to prevent double-join
exports.joinConversation = async (req, res) => {
    try {
        const ownerId = req.user.role === 'agent' ? req.user.ownerId : req.user._id;
        const business = await Business.findOne({ owner: ownerId });

        // Atomic findOneAndUpdate to prevent race condition where two agents join the same ticket
        const conversation = await Conversation.findOneAndUpdate(
            { 
                _id: req.params.id, 
                business: business._id
            },
            {
                $set: {
                    agent: req.user._id,
                    isAiActive: false,
                    status: 'in_progress',
                    routingStatus: 'assigned',
                    assignedAgentId: req.user._id,
                    assignedAt: new Date()
                }
            },
            { new: true }
        ).populate('agent', 'displayName profilePhoto roleTitle');

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Update Agent Status
        if (req.user.role === 'agent') {
            await User.findByIdAndUpdate(req.user._id, { 
                status: 'in_conversation',
                currentConversationId: conversation._id
            });
            if (req.io) {
                req.io.to(ownerId.toString()).emit('agent_status_changed', {
                    agentId: req.user._id,
                    status: 'in_conversation'
                });
            }
        }

        // Build the agent join message per spec
        const agentDisplayName = req.user.displayName || req.user.name;
        const agentRoleTitle = req.user.roleTitle || 'Support Agent';
        const joinMessage = {
            role: 'assistant',
            content: `AI has stepped aside. You are now chatting with ${agentDisplayName} — Real Human 🟢`,
            timestamp: new Date(),
            senderType: 'agent',
            senderName: agentDisplayName,
            senderAvatar: req.user.profilePhoto || null,
            senderRole: agentRoleTitle,
            sender: {
                name: agentDisplayName,
                profilePhoto: req.user.profilePhoto || null,
                userType: 'agent'
            }
        };

        conversation.messages.push(joinMessage);
        await conversation.save();

        // Emit agent_joined to all parties: widget session + owner room (covers agent dashboard too)
        if (req.io) {
            const agentDetails = {
                _id: req.user._id,
                displayName: agentDisplayName,
                roleTitle: agentRoleTitle,
                profilePhoto: req.user.profilePhoto || null
            };

            const joinPayload = {
                conversationId: conversation._id.toString(),
                agent: agentDetails,
                joinMessage,
            };

            // agent_joined → both widget and dashboard (to update header/status)
            req.io.to(`session_${conversation._id.toString()}`).emit('agent_joined', joinPayload);
            req.io.to(ownerId.toString()).emit('agent_joined', { ...joinPayload, messages: conversation.messages });

            // new_message → delivers the join message bubble to BOTH widget and dashboard
            const newMsgPayload = { conversationId: conversation._id.toString(), ...joinMessage };
            req.io.to(`session_${conversation._id.toString()}`).emit('new_message', newMsgPayload);
            req.io.to(ownerId.toString()).emit('new_message', newMsgPayload);
        }

        res.json({ message: 'Joined conversation', conversation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Agent: Mark Resolved (from dashboard)
exports.resolveConversation = async (req, res) => {
    const { summary } = req.body;
    try {
        const ownerId = req.user.role === 'agent' ? req.user.ownerId : req.user._id;
        const business = await Business.findOne({ owner: ownerId });

        const conversation = await Conversation.findOne({ 
            _id: req.params.id, 
            business: business._id 
        });

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found or access denied' });
        }

        const resolverType = req.user.role === 'agent' ? 'agent' : 'owner';
        const resolverName = req.user.role === 'agent' 
            ? (req.user.displayName || req.user.name)
            : req.user.name;

        conversation.status = 'human_resolved';
        conversation.isAiActive = true;
        conversation.resolvedBy = req.user._id.toString();
        conversation.resolvedByName = resolverName;
        conversation.resolvedByType = resolverType;
        conversation.resolvedAt = new Date();
        if (summary) conversation.title = summary;
        await conversation.save();

        // Update Agent Status back to Online if no other active chats
        if (req.user.role === 'agent') {
            const activeChats = await Conversation.countDocuments({
                agent: req.user._id,
                status: 'in_progress'
            });
            if (activeChats === 0) {
                await User.findByIdAndUpdate(req.user._id, { 
                    status: 'online',
                    currentConversationId: null
                });
                if (req.io) {
                    req.io.to(ownerId.toString()).emit('agent_status_changed', {
                        agentId: req.user._id,
                        status: 'online'
                    });
                }
            }
        }

        // Emit ticket_resolved to the room
        if (req.io) {
            req.io.to(ownerId.toString()).emit('ticket_resolved', {
                conversationId: conversation._id.toString(),
                resolvedBy: req.user._id.toString(),
                resolvedByName: resolverName,
                resolvedByType: resolverType,
                resolvedAt: conversation.resolvedAt
            });
        }

        res.json({ message: 'Conversation resolved', conversation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Business Owner: Notify specific offline agent to go online
exports.notifyAgent = async (req, res) => {
    const { message } = req.body;
    try {
        const agent = await User.findOne({ _id: req.params.id, ownerId: req.user._id });
        if (!agent) return res.status(404).json({ message: 'Agent not found' });

        // Cooldown check (10 mins)
        const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
        if (agent.lastNotifiedAt && agent.lastNotifiedAt > tenMinsAgo) {
            return res.status(429).json({ message: 'Agent was recently notified. Please wait before notifying again.' });
        }

        const pushService = require('../utils/pushService');
        const Business = require('../models/Business');
        const business = await Business.findOne({ owner: req.user._id });

        await pushService.sendNotification(agent._id, {
            type: 'go_online_request',
            title: `${business?.name || 'SupportBotAI'} — Action Required`,
            body: message || "You have pending support tickets. Please come online.",
            sound: 'urgent',
            data: { url: '/dashboard' }
        });

        agent.lastNotifiedAt = new Date();
        agent.pendingGoOnlineRequest = true;
        agent.goOnlineRequestTime = new Date();
        await agent.save();

        // Schedule check in 30 minutes
        const agenda = require('../utils/agenda');
        await agenda.schedule('30 minutes', 'monitor go online request', { 
            agentId: agent._id, 
            ownerId: req.user._id 
        });

        res.json({ message: `Notification sent to ${agent.name}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Business Owner: Notify all offline agents
exports.notifyAllAgents = async (req, res) => {
    try {
        const offlineAgents = await User.find({ 
            ownerId: req.user._id, 
            role: 'agent', 
            status: 'offline' 
        });

        if (offlineAgents.length === 0) {
            return res.status(400).json({ message: 'No offline agents found.' });
        }

        // Bulk cooldown check (15 mins)
        // We'll use the first agent's lastNotifiedAt as a proxy for the whole team bulk notification
        const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
        const recentlyNotified = offlineAgents.some(a => a.lastNotifiedAt && a.lastNotifiedAt > fifteenMinsAgo);
        
        if (recentlyNotified) {
            return res.status(429).json({ message: 'Team was recently notified. Please wait.' });
        }

        const pushService = require('../utils/pushService');
        const Business = require('../models/Business');
        const agenda = require('../utils/agenda');
        const business = await Business.findOne({ owner: req.user._id });

        const notifyPromises = offlineAgents.map(async (agent) => {
            await pushService.sendNotification(agent._id, {
                type: 'go_online_request',
                title: `${business?.name || 'SupportBotAI'} — Action Required`,
                body: "Multiple tickets are waiting. Please come online now.",
                sound: 'urgent',
                data: { url: '/dashboard' }
            });
            agent.lastNotifiedAt = new Date();
            agent.pendingGoOnlineRequest = true;
            agent.goOnlineRequestTime = new Date();
            await agent.save();

            // Schedule check in 30 minutes
            await agenda.schedule('30 minutes', 'monitor go online request', { 
                agentId: agent._id, 
                ownerId: req.user._id 
            });
        });

        await Promise.all(notifyPromises);

        res.json({ message: `Notification sent to ${offlineAgents.length} offline agents` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
