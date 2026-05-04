const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientBusinessId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Business',
        default: null
    },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Business' }],
    sentBy: { type: String, default: 'superadmin' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
