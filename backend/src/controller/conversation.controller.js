import Conversation from '../models/conversation.model.js';
import Business from '../models/business.model.js';
import User from '../models/user.model.js';

export const getConversations = async (req, res) => {
    try {
        const ownerId = req.user.role === 'agent' ? req.user.ownerId : req.user._id;
        const business = await Business.findOne({ owner: ownerId });
        if (!business) return res.status(404).json({ message: "Business not found" });

        const conversations = await Conversation.find({ business: business._id })
            .sort({ updatedAt: -1 })
            .populate('agent', 'name displayName profilePhoto');

        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getConversationById = async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id)
            .populate('agent', 'name displayName profilePhoto');
        if (!conversation) return res.status(404).json({ message: "Conversation not found" });
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const resolveConversation = async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation) return res.status(404).json({ message: "Conversation not found" });

        conversation.status = 'human_resolved';
        conversation.isAiActive = true;
        await conversation.save();

        res.json({ success: true, conversation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const toggleAi = async (req, res) => {
    const { isAiActive } = req.body;
    try {
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation) return res.status(404).json({ message: "Conversation not found" });

        conversation.isAiActive = isAiActive;
        await conversation.save();

        res.json({ success: true, isAiActive });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const sendAgentReply = async (req, res) => {
    const { content } = req.body;
    try {
        const conversation = await Conversation.findById(req.params.id).populate('business');
        if (!conversation) return res.status(404).json({ message: "Conversation not found" });

        const agentMsg = {
            role: 'assistant',
            content,
            timestamp: new Date(),
            senderType: req.user.role === 'owner' ? 'owner' : 'agent',
            senderName: req.user.displayName || req.user.name,
            senderAvatar: req.user.profilePhoto
        };

        conversation.messages.push(agentMsg);
        conversation.updatedAt = new Date();
        await conversation.save();

        // Emit to dashboard and widget
        if (req.io) {
            const room = conversation.business.owner.toString();
            req.io.to(room).emit('new_message', {
                conversationId: conversation._id.toString(),
                ...agentMsg
            });
            req.io.to(room).emit('update_conversation', conversation);
        }

        res.json({ success: true, message: agentMsg });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const upgradePlan = async (req, res) => {
    try {
        const business = await Business.findOneAndUpdate(
            { owner: req.user._id },
            { 
                plan: 'pro',
                conversationLimit: 10000 
            },
            { new: true }
        );
        res.json({ success: true, business });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};