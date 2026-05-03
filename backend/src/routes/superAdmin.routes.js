import express from 'express';
const router = express.Router();

import {
    login,
    getOverviewStats,
    getOverviewActivity,
    getOverviewChartData,
    getBusinesses,
    getBusinessDetails,
    updateBusinessPlan,
    getAgents,
    getAgentDetails,
    getConversations,
    getConversationDetails,
    getSubscriptions,
    getSettings,
    updateSettings,
    changePassword
} from '../controller/superAdmin.controller.js';

import {
    broadcastNotification,
    targetedNotification,
    getNotificationHistory
} from '../controller/notification.controller.js';

import { superAdminProtect } from '../middlewares/superAdmin.middleware.js';
import validateRequest from '../validators/validateRequest.js';
import {
    superAdminLoginValidator,
    businessIdValidator,
    updateBusinessPlanValidator,
    agentIdValidator,
    conversationIdValidator,
    updateSettingsValidator,
    changePasswordValidator,
    broadcastNotificationValidator,
    targetedNotificationValidator
} from '../validators/superAdmin.validator.js';

/**
 * @route   POST /api/super-admin/login
 * @desc    Authenticate super admin and return master JWT
 * @access  Public
 */
router.post('/login', superAdminLoginValidator, validateRequest, login);

/**
 * All routes below this line require the superAdminProtect middleware
 */
router.use(superAdminProtect);

/**
 * @route   GET /api/super-admin/overview/stats
 * @desc    Get high-level platform statistics (Total businesses, agents, etc.)
 * @access  Protected (Super Admin)
 */
router.get('/overview/stats', getOverviewStats);

/**
 * @route   GET /api/super-admin/overview/activity
 * @desc    Fetch recent activity feed across all tenants
 * @access  Protected (Super Admin)
 */
router.get('/overview/activity', getOverviewActivity);

/**
 * @route   GET /api/super-admin/overview/chart-data
 * @desc    Get chronological data for platform growth charts (30 days)
 * @access  Protected (Super Admin)
 */
router.get('/overview/chart-data', getOverviewChartData);

/**
 * @route   GET /api/super-admin/businesses
 * @desc    List all registered business tenants with aggregated metrics
 * @access  Protected (Super Admin)
 */
router.get('/businesses', getBusinesses);

/**
 * @route   GET /api/super-admin/businesses/:id
 * @desc    Get full profile, agent list, and conversation history for a specific business
 * @access  Protected (Super Admin)
 */
router.get('/businesses/:id', businessIdValidator, validateRequest, getBusinessDetails);

/**
 * @route   PATCH /api/super-admin/businesses/:id/plan
 * @desc    Manually update a business's subscription plan (Free/Pro)
 * @access  Protected (Super Admin)
 */
router.patch('/businesses/:id/plan', updateBusinessPlanValidator, validateRequest, updateBusinessPlan);

/**
 * @route   GET /api/super-admin/agents
 * @desc    Monitor all support agents across all businesses and their online status
 * @access  Protected (Super Admin)
 */
router.get('/agents', getAgents);

/**
 * @route   GET /api/super-admin/agents/:id
 * @desc    Get detailed performance history for a specific support agent
 * @access  Protected (Super Admin)
 */
router.get('/agents/:id', agentIdValidator, validateRequest, getAgentDetails);

/**
 * @route   GET /api/super-admin/conversations
 * @desc    View all conversation logs across the entire platform
 * @access  Protected (Super Admin)
 */
router.get('/conversations', getConversations);

/**
 * @route   GET /api/super-admin/conversations/:id
 * @desc    View specific conversation transcript and technical metadata
 * @access  Protected (Super Admin)
 */
router.get('/conversations/:id', conversationIdValidator, validateRequest, getConversationDetails);

/**
 * @route   GET /api/super-admin/subscriptions
 * @desc    List all active business subscriptions for billing management
 * @access  Protected (Super Admin)
 */
router.get('/subscriptions', getSubscriptions);

/**
 * @route   GET /api/super-admin/settings
 * @desc    Fetch global platform configuration (limits, names, prices)
 * @access  Protected (Super Admin)
 */
router.get('/settings', getSettings);

/**
 * @route   PUT /api/super-admin/settings
 * @desc    Update global platform-wide configurations
 * @access  Protected (Super Admin)
 */
router.put('/settings', updateSettingsValidator, validateRequest, updateSettings);

/**
 * @route   PUT /api/super-admin/settings/change-password
 * @desc    Update the Super Admin master password
 * @access  Protected (Super Admin)
 */
router.put('/settings/change-password', changePasswordValidator, validateRequest, changePassword);

/**
 * @route   POST /api/super-admin/notifications/broadcast
 * @desc    Send a real-time notification to every business on the platform
 * @access  Protected (Super Admin)
 */
router.post('/notifications/broadcast', broadcastNotificationValidator, validateRequest, broadcastNotification);

/**
 * @route   POST /api/super-admin/notifications/targeted
 * @desc    Send a real-time notification to a specific business owner
 * @access  Protected (Super Admin)
 */
router.post('/notifications/targeted', targetedNotificationValidator, validateRequest, targetedNotification);

/**
 * @route   GET /api/super-admin/notifications/history
 * @desc    Fetch history and reach analytics for all sent global notifications
 * @access  Protected (Super Admin)
 */
router.get('/notifications/history', getNotificationHistory);

export default router;