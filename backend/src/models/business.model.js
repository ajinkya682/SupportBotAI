import mongoose from 'mongoose';
import crypto from 'crypto';

/**
 * Business Schema (The Tenant)
 * Stores AI training data, widget customization, and usage limits.
 */
const BusinessSchema = new mongoose.Schema({
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: [true, 'Owner ID is required'],
        index: true 
    },
    name: { 
        type: String, 
        required: [true, 'Business name is required'],
        trim: true 
    },
    supportEmail: { 
        type: String,
        lowercase: true,
        trim: true 
    },
    
    // AI Training Data
    knowledge: { type: String, default: "" },
    knowledgeChunks: [{
        content: { type: String, trim: true },
        sourceUrl: { type: String, trim: true, default: null },
        chunkIndex: { type: Number },
        createdAt: { type: Date, default: Date.now }
    }],
    lastTrainedAt: { type: Date },
    trainedFromUrl: { type: String },
    trainedPagesCount: { type: Number, default: 0 },
    
    // Security & Access
    apiKey: { 
        type: String, 
        unique: true, 
        index: true 
    },
    allowedDomains: { 
        type: [String], 
        default: [],
        lowercase: true
    },
    
    faqs: [{
        question: { type: String, trim: true },
        answer: { type: String, trim: true }
    }],
    
    // Customization (Widget UI)
    appearance: {
        themeColor: { type: String, default: '#6366f1' },
        botName: { type: String },
        welcomeMessage: { type: String, default: 'Hello! How can I help you today?' },
        botAvatar: { type: String },
        companyLogo: { type: String },
        placeholderText: { type: String, default: 'Type your message...' }
    },
    
    // Quota & Billing
    plan: { 
        type: String, 
        enum: ['free', 'pro', 'enterprise'], 
        default: 'free' 
    },
    conversationLimit: { type: Number, default: 100 },
    conversationCount: { type: Number, default: 0 },
    
    // System Status
    lastActiveAt: { type: Date },
    notifications: [{
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }]
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

/**
 * MIDDLEWARE: Pre-save hooks
 */
BusinessSchema.pre('save', function(next) {
    // Set default botName if missing
    if (!this.appearance.botName) {
        this.appearance.botName = this.name;
    }

    // Auto-generate API Key for new business
    if (this.isNew && !this.apiKey) {
        this.apiKey = `sb_${crypto.randomBytes(16).toString('hex')}`;
    }
    
    next();
});

/**
 * METHODS: Instance helpers
 */
BusinessSchema.methods.hasReachedLimit = function() {
    return this.conversationCount >= this.conversationLimit;
};

// CRITICAL: OverwriteModelError check
const Business = mongoose.models.Business || mongoose.model('Business', BusinessSchema);

export default Business;