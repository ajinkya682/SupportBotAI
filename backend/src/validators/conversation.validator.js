import { body, param } from 'express-validator';

export const conversationIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid conversation ID format'),
];

export const sendAgentReplyValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid conversation ID format'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Reply content is required')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Reply content must be between 1-5000 characters'),
];

export const toggleAiValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid conversation ID format'),
  body('isAiActive')
    .isBoolean()
    .withMessage('isAiActive must be a boolean value'),
];

export const upgradePlanValidator = [
  body('plan')
    .optional()
    .isIn(['free', 'pro'])
    .withMessage('Plan must be free or pro'),
];