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
        // Password required tabhi hoga jab googleId na ho
        required: function() { return !this.googleId; }
    },
    googleId: { type: String },
    role: { 
        type: String, 
        enum: ['owner', 'agent', 'user'], 
        default: 'owner' 
    },
    ownerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        index: true // For faster agent lookups
    },
    profilePhoto: { type: String },
    displayName: { type: String },
    roleTitle: { type: String },
    status: { 
        type: String, 
        enum: ['online', 'in_conversation', 'away', 'offline'], 
        default: 'offline' 
    },
    lastHeartbeat: { 
        type: Date, 
        default: Date.now 
    },
    currentConversationId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Conversation' 
    },
    resetPasswordOTP: { type: String },
    resetPasswordExpires: { type: Date }
}, { 
    timestamps: true // Automatically manages createdAt and updatedAt
});

/**
 * Password Hashing Middleware
 */
userSchema.pre('save', async function(next) {
    // Only hash if password is modified or new
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
 * Instance Method to compare passwords
 */
userSchema.methods.comparePassword = async function(enteredPassword) {
    if (!this.password) return false; // Handle Google Login users
    return await bcrypt.compare(enteredPassword, this.password);
};

// CRITICAL: OverwriteModelError fix
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;