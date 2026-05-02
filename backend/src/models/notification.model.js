import mongoose from 'mongoose';

/**
 * Notification Schema for Superadmin to Business communication
 */
const notificationSchema = new mongoose.Schema({
    // Targeted business ID (null for global broadcast)
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
    
    readBy: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Business' 
    }],
    sentBy: { 
        type: String, 
        default: 'superadmin' 
    }
}, { 
    
    timestamps: true,
    
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


notificationSchema.index({ recipientBusinessId: 1, createdAt: -1 });

const notification = mongoose.model('Notification', notificationSchema);

export default notification;