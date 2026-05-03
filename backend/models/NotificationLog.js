const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: [
            'new_ticket', 'high_intent', 'assigned', 'message', 
            'go_online_request', 'team', 'report', 'billing', 
            'idle_reminder', 're-engagement'
        ]
    },
    title: String,
    body: String,
    data: Object,
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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('NotificationLog', notificationLogSchema);
