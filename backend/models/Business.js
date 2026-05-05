const mongoose = require('mongoose');
const crypto = require('crypto');

const BusinessSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    supportEmail: { type: String },
    knowledge: { type: String, default: "" },
    lastTrainedAt: { type: Date },
    trainedFromUrl: { type: String },
    trainedPagesCount: { type: Number },
    apiKey: { type: String, unique: true },
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
    }],
    isBlocked: { type: Boolean, default: false }
}, { timestamps: true });

BusinessSchema.pre('save', async function(next) {
    if (this.appearance && !this.appearance.botName) {
        this.appearance.botName = this.name;
    }
    // Auto-generate apiKey if missing
    if (!this.apiKey) {
        this.apiKey = `sb_${crypto.randomBytes(16).toString('hex')}`;
    }
    next();
});

module.exports = mongoose.model('Business', BusinessSchema);
