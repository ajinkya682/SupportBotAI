const mongoose = require('mongoose');

const platformConfigSchema = new mongoose.Schema({
    platformName: { type: String, default: 'SupportBotAI' },
    proPlanPrice: { type: Number, default: 29 },
    freeConversationLimit: { type: Number, default: 100 },
    proConversationLimit: { type: Number, default: 999999 },
    superAdminPasswordHash: { type: String }
});

module.exports = mongoose.model('PlatformConfig', platformConfigSchema);
