const mongoose = require('mongoose');

const PushNotificationLogSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    type: { 
        type: String, 
        required: true 
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Object },
    status: {
        type: String,
        enum: ['sent', 'failed', 'delivered', 'read', 'clicked'],
        default: 'sent'
    },
    error: String,
    deviceInfo: {
        browser: String,
        deviceType: String
    },
    responseReceived: {
        type: Boolean,
        default: false
    },
    respondedAt: Date,
    wasClicked: { type: Boolean, default: false },
    wasDismissed: { type: Boolean, default: false },
    sentAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('PushNotificationLog', PushNotificationLogSchema);
