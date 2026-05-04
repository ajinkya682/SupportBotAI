const Conversation = require('../models/Conversation');
const Business = require('../models/Business');

exports.getConversations = async (req, res) => {
    try {
        const ownerId = req.user.role === 'agent' ? req.user.ownerId : req.user._id;
        const business = await Business.findOne({ owner: ownerId });
        if (!business) return res.status(404).json({ message: "Business not found" });

        const conversations = await Conversation.find({ business: business._id })
            .populate('agent', 'displayName profilePhoto roleTitle')
            .sort({ updatedAt: -1 })
            .limit(50);
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getConversationById = async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id);
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.resolveConversation = async (req, res) => {
    try {
        const conversation = await Conversation.findByIdAndUpdate(
            req.params.id,
            { status: 'human_resolved' },
            { new: true }
        );
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.sendAgentReply = async (req, res) => {
    const { content } = req.body;
    try {
        const ownerId = req.user.role === 'agent' ? req.user.ownerId : req.user._id;
        const business = await Business.findOne({ owner: ownerId });
        if (!business) return res.status(404).json({ message: "Business not found" });

        const conversation = await Conversation.findOne({
            _id: req.params.id,
            business: business._id
        });
        if (!conversation) return res.status(404).json({ message: "Conversation not found" });

        let senderType = 'owner';
        let senderName = req.user.name;
        let senderAvatar = req.user.profilePhoto || null;
        let senderRole = null;
        
        if (req.user.role === 'agent') {
            senderType = 'agent';
            senderName = req.user.displayName || req.user.name;
            senderAvatar = req.user.profilePhoto || null;
            senderRole = req.user.roleTitle || null;
        }

        const newMessage = {
            role: 'assistant',
            content,
            timestamp: new Date(),
            senderType,
            senderName,
            senderAvatar,
            senderRole,
            sender: {
                name: senderName,
                profilePhoto: senderAvatar,
                userType: senderType
            }
        };

        conversation.messages.push(newMessage);
        // Keep status in_progress while human is actively replying
        if (conversation.status !== 'in_progress') {
            conversation.status = 'in_progress';
        }
        await conversation.save();

        // Emit new_message to the entire ownerId room
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

// Toggle AI on/off for a conversation
exports.toggleAi = async (req, res) => {
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

// Simulated Plan Upgrade
exports.upgradePlan = async (req, res) => {
    try {
        const business = await Business.findOneAndUpdate(
            { owner: req.user._id },
            { plan: 'pro', conversationLimit: 999999 },
            { new: true }
        );
        res.json(business);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
