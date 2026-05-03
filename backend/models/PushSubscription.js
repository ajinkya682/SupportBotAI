const mongoose = require('mongoose');

const PushSubscriptionSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    userRole: { 
        type: String, 
        enum: ['owner', 'agent', 'user'], 
        required: true 
    },
    subscription: {
        endpoint: { type: String, required: true },
        keys: {
            auth: { type: String, required: true },
            p256dh: { type: String, required: true }
        }
    },
    browser: { type: String },
    deviceType: { type: String },
    isActive: { type: Boolean, default: true },
    lastActiveAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('PushSubscription', PushSubscriptionSchema);
