import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Name is required'],
        trim: true 
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        unique: true,
        lowercase: true,
        trim: true 
    },
    password: { 
        type: String,
        
        required: function() { return !this.googleId; },
        select: false 
    },
    googleId: { 
        type: String,
        sparse: true 
    },
    role: { 
        type: String, 
        enum: ['owner', 'agent', 'user'], 
        default: 'owner' 
    },
    ownerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
        
    },
    profilePhoto: { 
        type: String,
        default: null 
    },
    displayName: { 
        type: String,
        trim: true 
    },
    roleTitle: { 
        type: String,
        trim: true 
    },
    status: { 
        type: String, 
        enum: ['online', 'in_conversation', 'away', 'offline'], 
        default: 'offline' 
    },
    availability: {
        type: String,
        enum: ['online', 'away', 'offline'],
        default: 'online'
    },
    lastHeartbeat: { 
        type: Date, 
        default: Date.now 
    },
    currentConversationId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Conversation',
        default: null
    },
    resetPasswordOTP: { type: String },
    resetPasswordExpires: { type: Date }
}, { 
    timestamps: true 
});

/**
 * MIDDLEWARE: Hash password before saving
 */
userSchema.pre('save', async function(next) {
    
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * INSTANCE METHOD: Compare entered password with hashed password in DB
 */
userSchema.methods.comparePassword = async function(enteredPassword) {
    if (!this.password) return false; // Handle users who only use Google Login
    return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * INDEXES: Optimized for high-performance queries
 * We use compound indexes to avoid "Duplicate Index" warnings.
 */

userSchema.index({ ownerId: 1, role: 1 });


userSchema.index({ lastHeartbeat: 1 });


userSchema.index({ status: 1, role: 1 });

/**
 * OVERWRITE PROTECTION:
 * Ensures the model isn't compiled twice during hot-reloads.
 */
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;