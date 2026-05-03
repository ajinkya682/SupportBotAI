const express = require('express');
const router = express.Router();
const { updatePhoto, changePassword } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.put('/update-photo', protect, updatePhoto);
router.put('/change-password', protect, changePassword);

module.exports = router;
