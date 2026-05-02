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
                const base64File = req.file.buffer.toString('base64');
                const result = await imagekit.files.upload({
                    file: base64File,
                    fileName: `agent-${agent._id}-${Date.now()}`,
                    folder: "/agent-profiles"
                });
                agent.profilePhoto = result.url;
            }

            if (displayName) agent.displayName = displayName;
            if (roleTitle) agent.roleTitle = roleTitle;
            
            // Activate profile if all required fields are present
            if (agent.displayName && agent.roleTitle && agent.profilePhoto) {
                agent.status = 'active';
                if (!agent.availability) agent.availability = 'online';
            }

            await agent.save();

            res.json({
                message: 'Profile updated successfully',
                agent: {
                    _id: agent._id,
                    displayName: agent.displayName,
                    roleTitle: agent.roleTitle,
                    profilePhoto: agent.profilePhoto,
                    status: agent.status,
                    availability: agent.availability
                }
            });
        } catch (error) {
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
                business: business._id,
                // Only join if not already assigned to someone else
                $or: [
                    { agent: { $exists: false } },
                    { agent: null },
                    { agent: req.user._id } // re-joining is allowed for self
                ]
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
            return res.status(409).json({ message: 'Conversation already assigned to another agent or not found' });
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

        // Build the system join message
        const joinMessage = {
            role: 'assistant',
            content: `You are now connected with ${req.user.displayName || req.user.name}, ${req.user.roleTitle || 'Support Agent'}.`,
            timestamp: new Date(),
            senderType: 'agent',
            senderName: req.user.displayName || req.user.name,
            senderAvatar: req.user.profilePhoto || null,
            senderRole: req.user.roleTitle || 'Support Agent',
            sender: {
                name: req.user.displayName || req.user.name,
                profilePhoto: req.user.profilePhoto || null,
                userType: 'agent'
            }
        };

        conversation.messages.push(joinMessage);
        await conversation.save();

        // Emit agent_joined to the entire room — all three parties receive it
        if (req.io) {
            const agentDetails = {
                _id: req.user._id,
                displayName: req.user.displayName || req.user.name,
                roleTitle: req.user.roleTitle || 'Support Agent',
                profilePhoto: req.user.profilePhoto || null
            };
            req.io.to(ownerId.toString()).emit('agent_joined', {
                conversationId: conversation._id.toString(),
                agent: agentDetails,
                joinMessage
            });
            // Also emit new_message so chatbot widget shows the join message
            req.io.to(ownerId.toString()).emit('new_message', {
                conversationId: conversation._id.toString(),
                ...joinMessage
            });
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
