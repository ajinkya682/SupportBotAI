const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// Public Push Routes for Guests
router.get('/vapid-public-key', notificationController.getVapidPublicKey);
router.post('/subscribe', notificationController.subscribe);

router.use(protect);

router.get('/', notificationController.getMyNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

// Protected Push Routes
router.post('/unsubscribe', notificationController.unsubscribe);
router.put('/preferences', notificationController.updatePreferences);
router.post('/test-push', notificationController.testPush);

module.exports = router;
