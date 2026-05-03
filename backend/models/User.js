const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    role: { type: String, enum: ['owner', 'agent', 'user'], default: 'owner' },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    profilePhoto: { type: String },
    displayName: { type: String },
    roleTitle: { type: String },
    status: { type: String, enum: ['online', 'in_conversation', 'away', 'offline'], default: 'offline' },
    lastHeartbeat: { type: Date, default: Date.now },
    currentConversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    resetPasswordOTP: { type: String },
    resetPasswordExpires: { type: Date },
    isBlocked: { type: Boolean, default: false },
    notificationPreferences: {
        newTickets: { type: Boolean, default: true },
        agentOfflineAlerts: { type: Boolean, default: true },
        conversationResolved: { type: Boolean, default: true },
        teamActivity: { type: Boolean, default: true },
        subscriptionAlerts: { type: Boolean, default: true },
        monthlyReports: { type: Boolean, default: true },
        ticketAssigned: { type: Boolean, default: true },
        newMessages: { type: Boolean, default: true },
        reassignmentAlerts: { type: Boolean, default: true },
        enableSounds: { type: Boolean, default: true },
        quietHours: {
            enabled: { type: Boolean, default: false },
            start: { type: String, default: '23:00' },
            end: { type: String, default: '07:00' }
        }
    },
    lastNotifiedAt: Date,
    pendingGoOnlineRequest: {
        type: Boolean,
        default: false
    },
    goOnlineRequestTime: Date,
    createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
