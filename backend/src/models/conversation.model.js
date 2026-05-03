import mongoose from 'mongoose';

/**
 * Message Schema (Sub-document)
 * Optimized to remove redundant fields.
 */
const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true
    },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },


    sender: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: { type: String, default: 'AI' },
        profilePhoto: { type: String },
        userType: {
            type: String,
            enum: ['user', 'ai', 'agent', 'owner'],
            default: 'ai'
        }
    }
}, {
    _id: true
});

/**
 * Conversation Schema
 * Features AI routing, emotion detection, and ticket lifecycle management.
 */
const ConversationSchema = new mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true,
        index: true
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    messages: [messageSchema],


    status: {
        type: String,
        enum: ['open', 'ai_resolved', 'human_needed', 'in_progress', 'human_resolved'],
        default: 'open',
        index: true
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
    title: { type: String, trim: true },


    userEmail: { type: String, lowercase: true, trim: true },
    userName: { type: String, default: 'Anonymous' },


    routingStatus: {
        type: String,
        enum: ['pending', 'assigned', 'holding', 'in_progress', 'resolved'],
        default: 'pending'
    },
    assignedAt: { type: Date },
    resolvedAt: { type: Date },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedByName: { type: String },
    resolvedByType: { type: String, enum: ['agent', 'owner', 'ai'] }
}, {
    timestamps: true,
    minimize: false
});


ConversationSchema.index({ business: 1, status: 1, updatedAt: -1 });

ConversationSchema.index({ userEmail: 1 });
ConversationSchema.index({ createdAt: 1 });
ConversationSchema.index({ agent: 1, status: 1 });
ConversationSchema.index({ business: 1, createdAt: -1 });
ConversationSchema.index({ status: 1, priority: 1 });

/**
 * Middleware: Set priority based on emotion
 */
ConversationSchema.pre('save', function (next) {
    if (this.emotion === 'angry' || this.emotion === 'urgent') {
        this.priority = 'high';
    }
    next();
});

const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);

export default Conversation;