import mongoose from 'mongoose';

/**
 * PlatformConfig Schema
 * Stores global settings for the entire SaaS platform.
 * Essential for Multi-Tenant plan management (Free vs Pro).
 */
const platformConfigSchema = new mongoose.Schema({
    platformName: {
        type: String,
        default: 'SupportBotAI',
        trim: true
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
        default: 1000000 // Cleaner than 999999
    },
    // Super Admin security
    superAdminPasswordHash: {
        type: String,
        select: false // Optimization: Password hash won't be fetched in normal queries
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    // Ensures we don't save empty objects
    minimize: false
});

/**
 * CRITICAL: OverwriteModelError Prevention
 */
const PlatformConfig = mongoose.models.PlatformConfig || mongoose.model('PlatformConfig', platformConfigSchema);

export default PlatformConfig;