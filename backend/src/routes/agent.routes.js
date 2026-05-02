import express from 'express';
const router = express.Router();

import {
    addAgent,
    listAgents,
    deleteAgent,
    updateProfile,
    updateAvailability,
    getAgentStats,
    joinConversation,
    resolveConversation
} from '../controller/agent.controller.js';


import { protect } from '../middlewares/auth.middleware.js';
import validateRequest from '../validators/validateRequest.js';
import {
    addAgentValidator,
    updateProfileValidator,
    updateAvailabilityValidator,
    agentIdValidator,
    joinConversationValidator,
    resolveConversationValidator
} from '../validators/agent.validator.js';

/**
 * @desc    Global Middleware
 * Saare agent routes protected hain, isliye baar-baar 'protect'
 * likhne ke bajaye hum router level par apply kar sakte hain.
 */
router.use(protect);

/**
 * @route   Management Routes (Business Owner)
 */
router.route('/')
    .get(listAgents)
    .post(addAgentValidator, validateRequest, addAgent);

router.delete('/:id', agentIdValidator, validateRequest, deleteAgent);

/**
 * @route   Agent Operational Routes
 */
router.get('/stats', getAgentStats);


router.patch('/update-profile', updateProfileValidator, validateRequest, updateProfile);

router.patch('/update-availability', updateAvailabilityValidator, validateRequest, updateAvailability);

/**
 * @route   Conversation Management
 */
router.patch('/join/:id', joinConversationValidator, validateRequest, joinConversation);
router.patch('/resolve/:id', resolveConversationValidator, validateRequest, resolveConversation);

export default router;