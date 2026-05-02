import mongoose from 'mongoose';

/**
 * Message Schema (Sub-document)
 * Optimized for per-message attribution in a multi-tenant environment.
 */
const messageSchema = new mongoose.Schema({
    role: { 
        type: String, 
        enum: ['user', 'assistant', 'system'], 
        required: true 
    },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    
    senderType: { 
        type: String, 
        enum: ['user', 'ai', 'agent', 'owner'], 
        default: 'ai' 
    },
    senderName: { type: String },
    senderAvatar: { type: String },
    senderRole: { type: String }, 
    
    sender: {
        name: String,
        profilePhoto: String,
        userType: { type: String, enum: ['ai', 'agent', 'owner'] }
    }
}, { _id: true });

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
        enum: ['ai_resolved', 'human_needed', 'in_progress', 'human_resolved'], 
        default: 'ai_resolved',
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
    userEmail: { type: String, index: true },
    userName: { type: String, default: 'Anonymous' },
    
    routingStatus: { 
        type: String, 
        enum: ['pending', 'assigned', 'holding', 'in_progress', 'resolved'], 
        default: 'pending' 
    },
    assignedAt: { type: Date },
    resolvedAt: { type: Date },
    resolvedByType: { type: String, enum: ['agent', 'owner', 'ai'] }
}, { 
    timestamps: true,
    minimize: true 
});

ConversationSchema.index({ business: 1, status: 1 });

const conversation = mongoose.model('Conversation', ConversationSchema);
export default conversation;