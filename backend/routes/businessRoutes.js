const express = require('express');
const router = express.Router();
const { 
    getBusiness, 
    updateBusiness, 
    getNotifications, 
    markNotificationsRead,
    scrapeAndTrain,
    uploadLogo 
} = require('../controllers/businessController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getBusiness);
router.put('/', protect, updateBusiness);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read', protect, markNotificationsRead);
router.post('/scrape', protect, scrapeAndTrain);
router.post('/logo-upload', protect, uploadLogo);

module.exports = router;
