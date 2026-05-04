const express = require('express');
const router = express.Router();
const { 
    getConversations, 
    getConversationById, 
    resolveConversation, 
    sendAgentReply,
    upgradePlan,
    toggleAi
} = require('../controllers/conversationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getConversations);
router.post('/upgrade', protect, upgradePlan);
router.get('/:id', protect, getConversationById);
router.put('/:id/resolve', protect, resolveConversation);
router.put('/:id/toggle-ai', protect, toggleAi);
router.post('/:id/reply', protect, sendAgentReply);

module.exports = router;
