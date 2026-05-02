const express = require('express');
const router = express.Router();
const { updatePhoto, changePassword, updateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.put('/update-photo', protect, updatePhoto);
router.put('/change-password', protect, changePassword);
router.put('/update', protect, updateProfile);

module.exports = router;
