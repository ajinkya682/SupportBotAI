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
import validateRequest from '../validators/validateRequest.js';
import {
    handleChatValidator,
    updateConversationStatusValidator,
    getWidgetConfigValidator,
    getConversationForWidgetValidator,
    getAgentSuggestionValidator
} from '../validators/chat.validator.js';

/**
 * @route   POST /api/chat
 * @desc    Main AI Chatbot interaction endpoint
 */
router.post('/', handleChatValidator, validateRequest, handleChat);

/**
 * @route   POST /api/chat/status
 * @desc    Update conversation status (resolve/reopen)
 */
router.post('/status', updateConversationStatusValidator, validateRequest, updateConversationStatus);

/**
 * @route   GET /api/chat/config/:apiKey
 * @desc    Fetch widget appearance and settings for a business
 */
router.get('/config/:apiKey', getWidgetConfigValidator, validateRequest, getWidgetConfig);

/**
 * @route   GET /api/chat/conversation/:id
 * @desc    Fetch specific conversation history for the widget
 */
router.get('/conversation/:id', getConversationForWidgetValidator, validateRequest, getConversationForWidget);

/**
 * @route   POST /api/chat/suggest
 * @desc    AI-powered reply suggestion for human agents
 * @access  Protected (Requires Agent/Owner Auth)
 */
router.post('/suggest', protect, getAgentSuggestionValidator, validateRequest, getAgentSuggestion);

export default router;