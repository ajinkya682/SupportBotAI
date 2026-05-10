const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderRole: { type: String, enum: ['superadmin', 'owner', 'agent'], required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Null for broadcasts
    recipientRole: { type: String, enum: ['owner', 'agent'], required: true },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', default: null }, // Context
    subject: { type: String, required: true },
    message: { type: String, required: true },
    isBroadcast: { type: Boolean, default: false },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Track which users read it
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
