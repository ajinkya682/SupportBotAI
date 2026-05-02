import mongoose from 'mongoose';

/**
 * Business Schema (The Tenant)
 * Stores AI training data, widget customization, and usage limits.
 */
const BusinessSchema = new mongoose.Schema({

    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        index: true 
    },
    name: { type: String, required: true },
    supportEmail: { type: String },
    
    knowledge: { type: String, default: "" },
    lastTrainedAt: { type: Date },
    trainedFromUrl: { type: String },
    trainedPagesCount: { type: Number },
    
    apiKey: { 
        type: String, 
        unique: true, 
        index: true 
    },
    
    faqs: [{
        question: String,
        answer: String
    }],
    
    appearance: {
        themeColor: { type: String, default: '#6366f1' },
        botName: { type: String },
        welcomeMessage: { type: String, default: 'Hello! How can I help you today?' },
        botAvatar: { type: String },
        companyLogo: { type: String },
        placeholderText: { type: String, default: 'Type your message...' }
    },
    
    plan: { type: String, enum: ['free', 'pro'], default: 'free' },
    conversationLimit: { type: Number, default: 100 },
    conversationCount: { type: Number, default: 0 },
    
    allowedDomains: { 
        type: [String], 
        default: [] 
    },
    
    lastActiveAt: { type: Date },
    
    notifications: [{
        message: String,
        isRead: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }]
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

BusinessSchema.pre('save', function(next) {
    if (!this.appearance.botName) {
        this.appearance.botName = this.name;
    }
    next();
});

BusinessSchema.methods.hasReachedLimit = function() {
    return this.conversationCount >= this.conversationLimit;
};

const Business = mongoose.model('Business', BusinessSchema);
export default Business;