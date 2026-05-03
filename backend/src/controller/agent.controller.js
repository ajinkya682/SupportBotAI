import User from '../models/user.model.js';
import Conversation from '../models/conversation.model.js';
import Business from '../models/business.model.js';
import imagekit from '../utils/imagekit.js';
import { uploadSinglePhoto } from '../service/storage.service.js';

/**
 * @route   POST /api/agent/add
 * @desc    Business Owner: Add a new agent to the business
 * @access  Private (Owner Only)
 */
export const addAgent = async (req, res) => {
    const { name, email, password } = req.body;
    try {

        const userExists = await User.findOne({ email }).select('_id').lean();
        if (userExists) return res.status(400).json({ message: 'User with this email already exists' });

        const agent = await User.create({
            name,
            email,
            password,
            role: 'agent',
            ownerId: req.user._id,
            status: 'inactive'
        });


        const { password: _, ...agentData } = agent.toObject();
        res.status(201).json({ message: 'Agent created successfully', agent: agentData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @route   GET /api/agent/list
 * @desc    Business Owner: List all agents with optimized performance stats
 * @access  Private (Owner Only)
 */
export const listAgents = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const business = await Business.findOne({ owner: ownerId }).lean();
        if (!business) return res.status(404).json({ message: "Business not found" });

        const agents = await User.find({ ownerId, role: 'agent' }).select('-password').lean();
        const agentIds = agents.map(a => a._id);


        const stats = await Conversation.aggregate([
            { $match: { agent: { $in: agentIds }, business: business._id } },
            {
                $group: {
                    _id: "$agent",
                    resolved: { $sum: { $cond: [{ $eq: ["$status", "human_resolved"] }, 1, 0] } },
                    handledToday: { $sum: { $cond: [{ $gte: ["$updatedAt", new Date(new Date().setHours(0, 0, 0, 0))] }, 1, 0] } }
                }
            }
        ]);

        const agentsWithStats = agents.map(agent => ({
            ...agent,
            stats: stats.find(s => s._id.toString() === agent._id.toString()) || { resolved: 0, handledToday: 0 }
        }));

        res.json(agentsWithStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @route   PATCH /api/agent/profile
 * @desc    Agent: Update profile details and upload photo via ImageKit
 * @access  Private (Agent Only)
 */
export const updateProfile = async (req, res) => {

    uploadSinglePhoto(req, res, async (err) => {
        if (err) return res.status(400).json({ message: err.message });

        const { displayName, roleTitle } = req.body;
        try {
            const agent = await User.findById(req.user._id);
            if (!agent) return res.status(404).json({ message: 'Agent not found' });

            if (req.file) {
                const uploadResponse = await imagekit.upload({
                    file: req.file.buffer.toString('base64'),
                    fileName: `agent-${agent._id}-${Date.now()}`,
                    folder: "/agent-profiles"
                });
                agent.profilePhoto = uploadResponse.url;
            }

            if (displayName) agent.displayName = displayName;
            if (roleTitle) agent.roleTitle = roleTitle;


            if (agent.displayName && agent.roleTitle && agent.profilePhoto) {
                agent.status = 'active';
                agent.availability = agent.availability || 'online';
            }

            await agent.save();
            res.json({ message: 'Profile updated successfully', agent });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};

/**
 * @route   PATCH /api/agent/join/:id
 * @desc    Agent: Join a live conversation (Atomic assignment)
 * @access  Private (Agent/Owner)
 */
export const joinConversation = async (req, res) => {
    try {
        const ownerId = req.user.role === 'agent' ? req.user.ownerId : req.user._id;
        const business = await Business.findOne({ owner: ownerId }).lean();


        const conversation = await Conversation.findOneAndUpdate(
            {
                _id: req.params.id,
                business: business._id,
                $or: [{ agent: { $exists: false } }, { agent: null }, { agent: req.user._id }]
            },
            {
                $set: {
                    agent: req.user._id,
                    isAiActive: false,
                    status: 'in_progress',
                    routingStatus: 'assigned',
                    assignedAt: new Date()
                }
            },
            { new: true }
        ).populate('agent', 'displayName profilePhoto roleTitle');

        if (!conversation) return res.status(409).json({ message: 'Conversation already assigned to another agent' });


        await User.findByIdAndUpdate(req.user._id, { status: 'in_conversation', currentConversationId: conversation._id });

        const joinMessage = {
            role: 'assistant',
            content: `Connected with ${req.user.displayName || req.user.name}, ${req.user.roleTitle || 'Support Agent'}.`,
            timestamp: new Date(),
            senderType: 'agent',
            sender: { name: req.user.displayName || req.user.name, userType: 'agent' }
        };

        conversation.messages.push(joinMessage);
        await conversation.save();

        if (req.io) {
            const room = ownerId.toString();
            req.io.to(room).emit('agent_joined', { conversationId: conversation._id, agent: conversation.agent, joinMessage });
            req.io.to(room).emit('agent_status_changed', { agentId: req.user._id, status: 'in_conversation' });
        }

        res.json({ message: 'Joined successfully', conversation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @route   PATCH /api/agent/resolve/:id
 * @desc    Agent: Mark a conversation as resolved
 * @access  Private (Agent/Owner)
 */
export const resolveConversation = async (req, res) => {
    const { summary } = req.body;
    try {
        const ownerId = req.user.role === 'agent' ? req.user.ownerId : req.user._id;
        const business = await Business.findOne({ owner: ownerId }).lean();

        const updateData = {
            status: 'human_resolved',
            isAiActive: true,
            resolvedBy: req.user._id,
            resolvedByName: req.user.displayName || req.user.name,
            resolvedByType: req.user.role,
            resolvedAt: new Date()
        };
        if (summary) updateData.title = summary;

        const conversation = await Conversation.findOneAndUpdate(
            { _id: req.params.id, business: business._id },
            { $set: updateData },
            { new: true }
        );

        if (!conversation) return res.status(404).json({ message: 'Conversation not found' });


        await User.findByIdAndUpdate(req.user._id, { status: 'online', currentConversationId: null });

        if (req.io) {
            const room = ownerId.toString();
            req.io.to(room).emit('ticket_resolved', { conversationId: conversation._id, ...updateData });
            req.io.to(room).emit('agent_status_changed', { agentId: req.user._id, status: 'online' });
        }

        res.json({ message: 'Conversation resolved', conversation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @route   DELETE /api/agent/:id
 * @desc    Business Owner: Remove an agent
 * @access  Private (Owner Only)
 */
export const deleteAgent = async (req, res) => {
    try {
        const agent = await User.findOne({ _id: req.params.id, ownerId: req.user._id });
        if (!agent) return res.status(404).json({ message: 'Agent not found' });

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Agent deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @route   PATCH /api/agent/availability
 * @desc    Agent: Update online/offline/busy status
 * @access  Private
 */
export const updateAvailability = async (req, res) => {
    const { availability } = req.body;
    try {
        const agent = await User.findByIdAndUpdate(
            req.user._id,
            { availability },
            { new: true }
        );

        if (req.io) {
            const ownerId = req.user.role === 'agent' ? req.user.ownerId : req.user._id;
            req.io.to(ownerId.toString()).emit('agent_status_changed', {
                agentId: req.user._id,
                availability: agent.availability
            });
        }

        res.json({ availability: agent.availability });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @route   GET /api/agent/stats
 * @desc    Agent: Get personal dashboard statistics
 * @access  Private
 */
export const getAgentStats = async (req, res) => {
    try {
        const ownerId = req.user.role === 'agent' ? req.user.ownerId : req.user._id;
        const business = await Business.findOne({ owner: ownerId }).lean();
        if (!business) return res.status(404).json({ message: 'Business not found' });

        const todayStart = new Date().setHours(0, 0, 0, 0);

        // Fetch multiple counts in parallel for performance
        const [handledToday, resolved, pending] = await Promise.all([
            Conversation.countDocuments({ business: business._id, agent: req.user._id, updatedAt: { $gte: todayStart } }),
            Conversation.countDocuments({ business: business._id, agent: req.user._id, status: 'human_resolved' }),
            Conversation.countDocuments({ business: business._id, status: 'human_needed', agent: { $exists: false } })
        ]);

        res.json({ handledToday, resolved, pending });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};