import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    // Per-message sender attribution
    senderType: { type: String, enum: ['user', 'ai', 'agent', 'owner'], default: 'ai' },
    senderName: { type: String },
    senderAvatar: { type: String },
    senderRole: { type: String }, // agent's role title
    // Legacy sender object (keep for backward compat)
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
        enum: ['ai_resolved', 'human_needed', 'in_progress', 'human_resolved', 'open', 'solved'], 
        default: 'open' 
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
    metadata: { type: Map, of: String },
    // Ticket lifecycle & Routing fields
    routingStatus: { 
        type: String, 
        enum: ['pending', 'assigned', 'holding', 'in_progress', 'resolved'], 
        default: 'pending' 
    },
    assignedAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedAt: { type: Date },
    resolvedBy: { type: String }, // agent ID or 'owner'
    resolvedByName: { type: String },
    resolvedByType: { type: String, enum: ['agent', 'owner', 'ai'] },
    resolvedAt: { type: Date },
}, { timestamps: true });

const Conversation = mongoose.model('Conversation', ConversationSchema);
export default Conversation;