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
