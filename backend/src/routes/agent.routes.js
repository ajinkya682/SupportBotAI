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

import { protect, ownerOnly } from '../middlewares/auth.middleware.js';

// Owner routes
router.post('/add', protect, ownerOnly, addAgent);
router.get('/list', protect, ownerOnly, listAgents);
router.delete('/:id', protect, ownerOnly, deleteAgent);

// Agent routes
router.put('/profile', protect, updateProfile);
router.put('/availability', protect, updateAvailability);
router.get('/stats', protect, getAgentStats);
router.post('/join/:id', protect, joinConversation);
router.post('/resolve/:id', protect, resolveConversation);

export default router;