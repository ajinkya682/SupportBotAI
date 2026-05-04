import User from '../models/user.model.js';
import Conversation from '../models/conversation.model.js';
import Business from '../models/business.model.js';
import bcrypt from 'bcryptjs';
import imagekit from '../utils/imagekit.js';
import { uploadSinglePhoto } from '../service/storage.service.js';

// Business Owner: Add a new agent
export const addAgent = async (req, res) => {
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
            ownerId: req.user._id,
            status: 'offline'
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
export const listAgents = async (req, res) => {
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
export const deleteAgent = async (req, res) => {
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
export const updateProfile = (req, res) => {
    uploadSinglePhoto(req, res, async (err) => {
        if (err) return res.status(400).json({ message: err.message });

        const { displayName, roleTitle } = req.body;
        
        try {
            const agent = await User.findById(req.user._id);
            if (!agent) return res.status(404).json({ message: 'Agent not found' });

            if (req.file) {
                const result = await imagekit.upload({
                    file: req.file.buffer.toString('base64'),
                    fileName: `agent-${agent._id}-${Date.now()}`,
                    folder: "/agent-profiles"
                });
                agent.profilePhoto = result.url;
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
                    status: agent.status
                }
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};

// Agent: Update Availability
export const updateAvailability = async (req, res) => {
    const { status } = req.body;
    try {
        const agent = await User.findByIdAndUpdate(
            req.user._id,
            { status },
            { new: true }
        );
        res.json({ status: agent.status });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Agent: Get Dashboard Stats
export const getAgentStats = async (req, res) => {
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

// Agent: Join Live Conversation
export const joinConversation = async (req, res) => {
    try {
        const ownerId = req.user.role === 'agent' ? req.user.ownerId : req.user._id;
        const business = await Business.findOne({ owner: ownerId });

        const conversation = await Conversation.findOneAndUpdate(
            { 
                _id: req.params.id, 
                business: business._id,
                $or: [
                    { agent: { $exists: false } },
                    { agent: null },
                    { agent: req.user._id }
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
            return res.status(409).json({ message: 'Conversation already assigned or not found' });
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

        const joinMessage = {
            role: 'assistant',
            content: `You are now connected with ${req.user.displayName || req.user.name}, ${req.user.roleTitle || 'Support Agent'}.`,
            timestamp: new Date(),
            senderType: 'agent',
            senderName: req.user.displayName || req.user.name,
            senderAvatar: req.user.profilePhoto || null,
            senderRole: req.user.roleTitle || 'Support Agent'
        };

        conversation.messages.push(joinMessage);
        await conversation.save();

        if (req.io) {
            req.io.to(ownerId.toString()).emit('agent_joined', {
                conversationId: conversation._id.toString(),
                agent: {
                    _id: req.user._id,
                    displayName: req.user.displayName || req.user.name,
                    roleTitle: req.user.roleTitle || 'Support Agent',
                    profilePhoto: req.user.profilePhoto || null
                },
                joinMessage
            });
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

// Agent: Mark Resolved
export const resolveConversation = async (req, res) => {
    const { summary } = req.body;
    try {
        const ownerId = req.user.role === 'agent' ? req.user.ownerId : req.user._id;
        const business = await Business.findOne({ owner: ownerId });

        const conversation = await Conversation.findOne({ 
            _id: req.params.id, 
            business: business._id 
        });

        if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

        conversation.status = 'human_resolved';
        conversation.isAiActive = true;
        conversation.resolvedBy = req.user._id.toString();
        conversation.resolvedByName = req.user.displayName || req.user.name;
        conversation.resolvedByType = req.user.role === 'agent' ? 'agent' : 'owner';
        conversation.resolvedAt = new Date();
        if (summary) conversation.title = summary;
        await conversation.save();

        if (req.user.role === 'agent') {
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

        if (req.io) {
            req.io.to(ownerId.toString()).emit('ticket_resolved', {
                conversationId: conversation._id.toString(),
                resolvedByName: conversation.resolvedByName,
                resolvedAt: conversation.resolvedAt
            });
        }

        res.json({ message: 'Conversation resolved', conversation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};