import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    role: { type: String, enum: ['owner', 'agent', 'user'], default: 'owner' },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For agents, links to their owner
    profilePhoto: { type: String },
    displayName: { type: String },
    roleTitle: { type: String },
    status: { type: String, enum: ['online', 'in_conversation', 'away', 'offline'], default: 'offline' },
    lastHeartbeat: { type: Date, default: Date.now },
    currentConversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    resetPasswordOTP: { type: String },
    resetPasswordExpires: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

/* Hash password before saving */
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

/* Compare password */
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const user = mongoose.model('User', userSchema);
export default user;