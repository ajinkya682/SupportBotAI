import express from 'express';
const router = express.Router();

import {
    getBusiness,
    updateBusiness,
    getNotifications,
    markNotificationsRead,
    scrapeAndTrain,
    uploadLogo
} from '../controller/business.controller.js';

import { protect } from '../middlewares/auth.middleware.js';
import validateRequest from '../validators/validateRequest.js';
import {
    updateBusinessValidator,
    scrapeAndTrainValidator
} from '../validators/business.validator.js';

/**
 * @desc    Global Middleware
 * Saare business routes private hain, isliye baar-baar 'protect'
 * likhne ke bajaye hum router level par apply kar sakte hain.
 */
router.use(protect);

/**
 * @route   Management & Profile
 */
router.route('/')
    .get(getBusiness)
    .patch(updateBusinessValidator, validateRequest, updateBusiness);

/**
 * @route   System Notifications
 */
router.get('/notifications', getNotifications);
router.patch('/notifications/read', markNotificationsRead);

/**
 * @route   AI Training & Assets
 */
router.post('/scrape', scrapeAndTrainValidator, validateRequest, scrapeAndTrain);
router.post('/logo-upload', uploadLogo);

export default router;