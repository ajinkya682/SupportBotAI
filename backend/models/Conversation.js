const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    senderType: { type: String, enum: ['user', 'ai', 'agent', 'owner'], default: 'ai' },
    senderName: { type: String },
    senderAvatar: { type: String },
    senderRole: { type: String },
    sender: {
        name: String,
        profilePhoto: String,
        userType: { type: String, enum: ['ai', 'agent', 'owner'] }
    }
}, { _id: true });

const ConversationSchema = new mongoose.Schema({
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    messages: [messageSchema],
    status: { 
        type: String, 
        enum: ['ai_resolved', 'human_needed', 'in_progress', 'human_resolved'], 
        default: 'ai_resolved' 
    },
    priority: { 
        type: String, 
        enum: ['low', 'medium', 'high'], 
        default: 'low' 
    },
    isAiActive: { type: Boolean, default: true },
    emotion: { 
        type: String, 
        enum: ['neutral', 'happy', 'frustrated', 'angry', 'urgent'], 
        default: 'neutral' 
    },
    intent: { type: String, default: 'general_query' },
    lastIntent: { type: String },
    userEmail: { type: String },
    userName: { type: String, default: 'Anonymous' },
    title: { type: String, default: 'New Conversation' },
    origin: { type: String }, // The URL of the site where chat started
    metadata: { type: Map, of: String },
    issueSummary: { type: String }, // AI-generated summary of the problem
    routingStatus: { 
        type: String, 
        enum: ['pending', 'assigned', 'holding', 'in_progress', 'resolved'], 
        default: 'pending' 
    },
    assignedAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedAt: { type: Date },
    resolvedBy: { type: String },
    resolvedByName: { type: String },
    resolvedByType: { type: String, enum: ['agent', 'owner', 'ai'] },
    resolvedAt: { type: Date },
    aiGroundedStatus: { 
        type: String, 
        enum: ['answered', 'fallback-empty', 'fallback-irrelevant'], 
        default: 'answered' 
    },
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);
