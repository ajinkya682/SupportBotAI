import { body, param } from 'express-validator';

export const superAdminLoginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email must be valid'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 1 })
    .withMessage('Password cannot be empty'),
];

export const businessIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid business ID format'),
];

export const updateBusinessPlanValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid business ID format'),
  body('plan')
    .isIn(['free', 'pro'])
    .withMessage('Plan must be free or pro'),
];

export const agentIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid agent ID format'),
];

export const conversationIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid conversation ID format'),
];

export const updateSettingsValidator = [
  body('superAdminEmail')
    .optional()
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Super admin email must be valid'),
  body('superAdminPassword')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Super admin password must be at least 8 characters'),
  body('defaultConversationLimit')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Default conversation limit must be between 1-10000'),
  body('platformName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Platform name must be between 1-100 characters'),
];

export const changePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters'),
];

export const broadcastNotificationValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Notification title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1-200 characters'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Notification message is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1-1000 characters'),
  body('type')
    .optional()
    .isIn(['info', 'warning', 'success', 'error'])
    .withMessage('Type must be info, warning, success, or error'),
];

export const targetedNotificationValidator = [
  body('businessId')
    .isMongoId()
    .withMessage('Invalid business ID format'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Notification title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1-200 characters'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Notification message is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1-1000 characters'),
  body('type')
    .optional()
    .isIn(['info', 'warning', 'success', 'error'])
    .withMessage('Type must be info, warning, success, or error'),
];