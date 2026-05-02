import mongoose from 'mongoose';

/**
 * Notification Schema for Superadmin to Business communication
 */
const notificationSchema = new mongoose.Schema({
    // Targeted business ID (null means global broadcast to all tenants)
    recipientBusinessId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Business',
        default: null,
        index: true 
    },
    subject: { 
        type: String, 
        required: [true, 'Subject is required'],
        trim: true 
    },
    message: { 
        type: String, 
        required: [true, 'Message body is required'] 
    },
    
    // Tracking read status per business tenant
    readBy: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Business' 
    }],
    sentBy: { 
        type: String, 
        default: 'superadmin' 
    }
}, { 
    // Automatically manages createdAt and updatedAt
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound index for fast retrieval of latest notifications for a specific business
notificationSchema.index({ recipientBusinessId: 1, createdAt: -1 });

/**
 * CRITICAL: OverwriteModelError Prevention
 * Check if the model already exists in the connection registry before compiling.
 */
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export default Notification;