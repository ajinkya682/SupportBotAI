const mongoose = require('mongoose');

const platformConfigSchema = new mongoose.Schema({
    platformName: { type: String, default: 'SupportBotAI' },
    proPlanPrice: { type: Number, default: 29 },
    freeConversationLimit: { type: Number, default: 100 },
    proConversationLimit: { type: Number, default: 999999 },
    maintenanceMode: { type: Boolean, default: false },
    superAdminPasswordHash: { type: String },
    heroVideoUrl: { type: String, default: 'https://drive.google.com/file/d/1pLfBH1QpokINZq0_7NW7an-lSC_kzYQy/preview' },
    twitterUrl: { type: String, default: 'https://twitter.com' },
    linkedinUrl: { type: String, default: 'https://linkedin.com' },
    githubUrl: { type: String, default: 'https://github.com' }
});

module.exports = mongoose.model('PlatformConfig', platformConfigSchema);
