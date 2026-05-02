import Conversation from '../models/conversation.model.js';
import Business from '../models/business.model.js';

/**
 * Helper function to determine the correct business owner ID
 */
const getOwnerId = (user) => user.role === 'agent' ? user.ownerId : user._id;

export const getConversations = async (req, res) => {
    try {
        const ownerId = getOwnerId(req.user);
        
        const business = await Business.findOne({ owner: ownerId }).select('_id').lean();
        if (!business) return res.status(404).json({ message: "Business not found" });

        const conversations = await Conversation.find({ business: business._id })
            .populate('agent', 'displayName profilePhoto roleTitle')
            .sort({ updatedAt: -1 })
            .limit(50)
            .lean();
            
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getConversationById = async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id).lean();
        if (!conversation) return res.status(404).json({ message: "Conversation not found" });
        
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const resolveConversation = async (req, res) => {
    try {
        const conversation = await Conversation.findByIdAndUpdate(
            req.params.id,
            { status: 'human_resolved' },
            { new: true }
        ).lean();
        
        if (!conversation) return res.status(404).json({ message: "Conversation not found" });
        
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const sendAgentReply = async (req, res) => {
    const { content } = req.body;
    try {
        const ownerId = getOwnerId(req.user);
        
        // Optimization: Only fetch the _id field
        const business = await Business.findOne({ owner: ownerId }).select('_id').lean();
        if (!business) return res.status(404).json({ message: "Business not found" });

        const conversation = await Conversation.findOne({
            _id: req.params.id,
            business: business._id
        });
        if (!conversation) return res.status(404).json({ message: "Conversation not found" });

        const isAgent = req.user.role === 'agent';
        const senderType = isAgent ? 'agent' : 'owner';
        const senderName = isAgent ? (req.user.displayName || req.user.name) : req.user.name;
        const senderAvatar = req.user.profilePhoto || null;

        const newMessage = {
            role: 'assistant',
            content,
            timestamp: new Date(),
            senderType,
            senderName,
            senderAvatar,
            senderRole: isAgent ? (req.user.roleTitle || null) : null,
            sender: {
                name: senderName,
                profilePhoto: senderAvatar,
                userType: senderType
            }
        };

        conversation.messages.push(newMessage);
        
        if (conversation.status !== 'in_progress') {
            conversation.status = 'in_progress';
        }
        await conversation.save();

        if (req.io) {
            req.io.to(ownerId.toString()).emit('new_message', {
                conversationId: conversation._id.toString(),
                ...newMessage
            });
        }

        res.json(conversation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const toggleAi = async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation) return res.status(404).json({ message: "Conversation not found" });

        conversation.isAiActive = !conversation.isAiActive;
        if (!conversation.isAiActive) {
            conversation.status = 'human_needed';
        }
        await conversation.save();
        
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const upgradePlan = async (req, res) => {
    try {
        const business = await Business.findOneAndUpdate(
            { owner: req.user._id },
            { plan: 'pro', conversationLimit: 999999 },
            { new: true }
        ).lean();
        
        if (!business) return res.status(404).json({ message: "Business not found" });
        
        res.json(business);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};