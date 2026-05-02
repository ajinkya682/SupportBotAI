import express from 'express';
const router = express.Router();


import { 
    registerUser, 
    loginUser, 
    googleLogin, 
    getUserProfile, 
    getAllUsers,
    forgotPassword,
    resetPassword
} from '../controller/auth.controller.js';


import { protect, admin } from '../middlewares/auth.middleware.js';
import validateRequest from '../validators/validateRequest.js';


import {
    registerValidator,
    loginValidator,
    googleLoginValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
} from '../validators/auth.validator.js';

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user/business owner
 * @access  Public
 */
router.post('/register', registerValidator, validateRequest, registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', loginValidator, validateRequest, loginUser);

/**
 * @route   POST /api/auth/google
 * @desc    Google OAuth login/signup
 * @access  Public
 */
router.post('/google', googleLoginValidator, validateRequest, googleLogin);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password', forgotPasswordValidator, validateRequest, forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
router.post('/reset-password', resetPasswordValidator, validateRequest, resetPassword);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current logged-in user details
 * @access  Private
 */
router.get('/profile', protect, getUserProfile);

/**
 * @route   GET /api/auth/admin/users
 * @desc    Get all registered users (Admin only)
 * @access  Private/Admin
 */
router.get('/admin/users', protect, admin, getAllUsers);

export default router;