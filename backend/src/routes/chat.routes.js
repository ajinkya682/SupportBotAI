import express from 'express';
const router = express.Router();

import { 
    handleChat, 
    getWidgetConfig, 
    getAgentSuggestion, 
    getConversationForWidget, 
    updateConversationStatus 
} from '../controller/chat.controller.js';
import { protect } from '../middlewares/auth.middleware.js';



/**
 * @route   POST /api/chat
 * @desc    Main AI Chatbot interaction endpoint
 */
router.post('/', handleChat);

/**
 * @route   POST /api/chat/status
 * @desc    Update conversation status (resolve/reopen)
 */
router.post('/status', updateConversationStatus);

/**
 * @route   GET /api/chat/config/:apiKey
 * @desc    Fetch widget appearance and settings for a business
 */
router.get('/config/:apiKey', getWidgetConfig);

/**
 * @route   GET /api/chat/conversation/:id
 * @desc    Fetch specific conversation history for the widget
 */
router.get('/conversation/:id', getConversationForWidget);

/**
 * @route   POST /api/chat/suggest
 * @desc    AI-powered reply suggestion for human agents
 * @access  Protected (Requires Agent/Owner Auth)
 */
router.post('/suggest', protect, getAgentSuggestion);

export default router;