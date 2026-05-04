const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const { superAdminProtect } = require('../middleware/superAdminMiddleware');

// Public route for login
router.post('/login', superAdminController.login);

// Protected routes
router.use(superAdminProtect);

// Overview
router.get('/overview/stats', superAdminController.getOverviewStats);
router.get('/overview/activity', superAdminController.getOverviewActivity);
router.get('/overview/chart-data', superAdminController.getOverviewChartData);

// Businesses
router.get('/businesses', superAdminController.getBusinesses);
router.get('/businesses/:id', superAdminController.getBusinessDetails);
router.patch('/businesses/:id/plan', superAdminController.updateBusinessPlan);

// Agents
router.get('/agents', superAdminController.getAgents);
router.get('/agents/:id', superAdminController.getAgentDetails);

// Conversations
router.get('/conversations', superAdminController.getConversations);
router.get('/conversations/:id', superAdminController.getConversationDetails);

// Subscriptions
router.get('/subscriptions', superAdminController.getSubscriptions);

// Settings
router.get('/settings', superAdminController.getSettings);
router.put('/settings', superAdminController.updateSettings);
router.put('/settings/change-password', superAdminController.changePassword);
// Notifications
const notificationController = require('../controllers/notificationController');
router.post('/notifications/broadcast', notificationController.broadcastNotification);
router.post('/notifications/targeted', notificationController.targetedNotification);
router.get('/notifications/history', notificationController.getNotificationHistory);

module.exports = router;
