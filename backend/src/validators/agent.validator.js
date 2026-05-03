import { body, param } from 'express-validator';

export const addAgentValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Agent name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Agent name must be between 2-100 characters'),
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
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

export const updateProfileValidator = [
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Display name must be between 2-100 characters'),
  body('roleTitle')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Role title must be between 2-100 characters'),
];

export const updateAvailabilityValidator = [
  body('availability')
    .optional()
    .isIn(['online', 'away', 'busy'])
    .withMessage('Availability must be online, away, or busy'),
];

export const agentIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid agent ID format'),
];

export const joinConversationValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid conversation ID format'),
];

export const resolveConversationValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid conversation ID format'),
];