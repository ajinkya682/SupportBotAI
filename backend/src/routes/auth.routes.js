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

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/profile', protect, getUserProfile);

router.get('/admin/users', protect, admin, getAllUsers);

export default router;