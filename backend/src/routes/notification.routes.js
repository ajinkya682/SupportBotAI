import express from 'express';
const router = express.Router();

import { 
    getMyNotifications, 
    markAllAsRead, 
    markAsRead 
} from '../controller/notification.controller.js';

import { protect } from '../middlewares/auth.middleware.js';

/**
 * Notification Routes
 * Access is restricted to authenticated users (Owners/Agents).
 */
router.use(protect);

/**
 * @route   GET /api/notifications/
 * @desc    Fetch all broadcast and targeted notifications for the current business
 * @access  Protected
 */
router.get('/', getMyNotifications);

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Perform a bulk update to mark all unread notifications as read
 * @access  Protected
 */
router.patch('/read-all', markAllAsRead);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark a specific notification as read for the authenticated tenant
 * @access  Protected
 */
router.patch('/:id/read', markAsRead);

export default router;