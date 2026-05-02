import mongoose from 'mongoose';

/**
 * PlatformConfig Schema
 * This model stores global settings for the entire SaaS platform.
 * It is essential for managing Multi-Tenant limits (Free vs Pro).
 */
const platformConfigSchema = new mongoose.Schema({
    platformName: { 
        type: String, 
        default: 'SupportBotAI' 
    },
    proPlanPrice: { 
        type: Number, 
        default: 29 
    },
    freeConversationLimit: { 
        type: Number, 
        default: 100 
    },
    proConversationLimit: { 
        type: Number, 
        default: 999999 
    },
    // Used for the Super Admin role to manage global platform analytics
    superAdminPasswordHash: { 
        type: String 
    } 
}, { 
    timestamps: true // Optimization: Tracks when limits were last updated
});

// Default export for the model
const PlatformConfig = mongoose.model('PlatformConfig', platformConfigSchema);
export default PlatformConfig;