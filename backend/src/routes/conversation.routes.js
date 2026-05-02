import express from 'express';
const router = express.Router();

import { 
    getConversations, 
    getConversationById, 
    resolveConversation, 
    sendAgentReply,
    upgradePlan,
    toggleAi
} from '../controller/conversation.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

/**
 * @route   GET /api/conversations/
 * @desc    Get a list of all conversations for the business
 * @access  Protected (Agent/Owner)
 */
router.get('/', protect, getConversations);

/**
 * @route   POST /api/conversations/upgrade
 * @desc    Simulate upgrading the business plan to Pro
 * @access  Protected (Owner)
 */
router.post('/upgrade', protect, upgradePlan);

/**
 * @route   GET /api/conversations/:id
 * @desc    Fetch a specific conversation by its ID
 * @access  Protected (Agent/Owner)
 */
router.get('/:id', protect, getConversationById);

/**
 * @route   PUT /api/conversations/:id/resolve
 * @desc    Mark a conversation as resolved by a human
 * @access  Protected (Agent/Owner)
 */
router.put('/:id/resolve', protect, resolveConversation);

/**
 * @route   PUT /api/conversations/:id/toggle-ai
 * @desc    Toggle the AI assistant on or off for a specific conversation
 * @access  Protected (Agent/Owner)
 */
router.put('/:id/toggle-ai', protect, toggleAi);

/**
 * @route   POST /api/conversations/:id/reply
 * @desc    Send a reply from a human agent/owner in the conversation
 * @access  Protected (Agent/Owner)
 */
router.post('/:id/reply', protect, sendAgentReply);

export default router;