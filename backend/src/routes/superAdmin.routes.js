import express from 'express';
const router = express.Router();

import {
    getOverviewStats,
    getOverviewActivity,
    getOverviewChartData,
    getBusinesses,
    getBusinessDetails,
    updateBusinessPlan,
    getAgents,
    getAgentDetails,
    getConversations,
    getConversationDetails
} from '../controller/superAdmin.controller.js';

import { protect, superAdminOnly } from '../middlewares/auth.middleware.js';

router.use(protect);
router.use(superAdminOnly);

// Overview
router.get('/stats', getOverviewStats);
router.get('/activity', getOverviewActivity);
router.get('/chart', getOverviewChartData);

// Businesses
router.get('/businesses', getBusinesses);
router.get('/businesses/:id', getBusinessDetails);
router.put('/businesses/:id/plan', updateBusinessPlan);

// Agents
router.get('/agents', getAgents);
router.get('/agents/:id', getAgentDetails);

// Conversations
router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversationDetails);

export default router;