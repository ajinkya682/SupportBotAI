const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleLogin, getUserProfile, getAllUsers } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/profile', protect, getUserProfile);
router.post('/change-password', protect, require('../controllers/authController').changePassword);
router.post('/forgot-password', require('../controllers/authController').forgotPassword);
router.post('/verify-otp', require('../controllers/authController').verifyOTP);
router.post('/reset-password', require('../controllers/authController').resetPassword);
router.get('/admin/users', protect, admin, getAllUsers);

module.exports = router;
