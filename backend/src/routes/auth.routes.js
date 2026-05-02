import express from 'express';
const router = express.Router();
import { protect, admin } from '../middlewares/auth.middleware.js';

import { 
    registerUser, 
    loginUser,  
    getUserProfile, 
    getAllUsers,
} from '../controller/auth.controller.js';

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.get('/admin/users', protect, admin, getAllUsers);

export default router;