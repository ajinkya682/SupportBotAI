import express from 'express';
const router = express.Router();

import { 
    registerUser, 
    loginUser, 
    googleLogin, 
    getUserProfile, 
    getAllUsers,
    forgotPassword,
    verifyOTP,
    resetPassword,
    changePassword
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

router.post('/register', registerValidator, validateRequest, registerUser);
router.post('/login', loginValidator, validateRequest, loginUser);
router.post('/google', googleLoginValidator, validateRequest, googleLogin);
router.post('/forgot-password', forgotPasswordValidator, validateRequest, forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPasswordValidator, validateRequest, resetPassword);

router.get('/profile', protect, getUserProfile);
router.post('/change-password', protect, changePassword);

router.get('/admin/users', protect, admin, getAllUsers);

export default router;