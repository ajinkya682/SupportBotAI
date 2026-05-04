const express = require('express');
const router = express.Router();
const { 
    handleChat, 
    getWidgetConfig, 
    getAgentSuggestion,
    getConversationForWidget,
    updateConversationStatus 
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', handleChat);
router.post('/status', updateConversationStatus);
router.get('/config/:apiKey', getWidgetConfig);
router.get('/conversation/:id', getConversationForWidget);
router.post('/suggest', protect, getAgentSuggestion);

module.exports = router;
