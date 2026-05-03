const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const { superAdminProtect } = require('../middleware/superAdminMiddleware');

// Public routes for login and config
router.post('/login', superAdminController.login);
router.get('/config', superAdminController.getPublicConfig);

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

// Reports
router.get('/export-report', superAdminController.exportReport);
router.get('/export-businesses', superAdminController.exportBusinesses);
router.get('/export-agents', superAdminController.exportAgents);
router.get('/export-conversations', superAdminController.exportConversations);
router.get('/export-subscriptions', superAdminController.exportSubscriptions);
router.get('/export-notifications', superAdminController.exportNotifications);
router.get('/export-settings', superAdminController.exportSettings);

// Actions
router.post('/businesses/:id/block', superAdminController.blockBusiness);
router.delete('/businesses/:id', superAdminController.deleteBusiness);
router.post('/agents/:id/block', superAdminController.blockAgent);
router.delete('/agents/:id', superAdminController.deleteAgent);

// Notifications
const notificationController = require('../controllers/notificationController');
router.post('/notifications/broadcast', notificationController.broadcastToOwners);
router.post('/notifications/targeted', notificationController.targetedToOwner);
router.get('/notifications/history', notificationController.getNotificationHistory);

module.exports = router;
