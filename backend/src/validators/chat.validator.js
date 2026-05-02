import { body, param } from 'express-validator';

export const handleChatValidator = [
  body('apiKey')
    .trim()
    .notEmpty()
    .withMessage('API key is required')
    .isLength({ min: 10, max: 100 })
    .withMessage('API key must be between 10-100 characters'),
  body('messages')
    .isArray({ min: 1 })
    .withMessage('Messages must be a non-empty array'),
  body('messages.*.role')
    .isIn(['user', 'assistant'])
    .withMessage('Message role must be user or assistant'),
  body('messages.*.content')
    .trim()
    .notEmpty()
    .withMessage('Message content cannot be empty')
    .isLength({ max: 5000 })
    .withMessage('Message content cannot exceed 5000 characters'),
  body('conversationId')
    .optional()
    .isMongoId()
    .withMessage('Invalid conversation ID format'),
  body('userName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('User name cannot exceed 100 characters'),
];

export const updateConversationStatusValidator = [
  body('conversationId')
    .isMongoId()
    .withMessage('Invalid conversation ID format'),
  body('status')
    .isIn(['resolved', 'reopened'])
    .withMessage('Status must be resolved or reopened'),
];

export const getWidgetConfigValidator = [
  param('apiKey')
    .trim()
    .notEmpty()
    .withMessage('API key is required')
    .isLength({ min: 10, max: 100 })
    .withMessage('API key must be between 10-100 characters'),
];

export const getConversationForWidgetValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid conversation ID format'),
];

export const getAgentSuggestionValidator = [
  body('messages')
    .isArray({ min: 1 })
    .withMessage('Messages must be a non-empty array'),
  body('messages.*.role')
    .isIn(['user', 'assistant'])
    .withMessage('Message role must be user or assistant'),
  body('messages.*.content')
    .trim()
    .notEmpty()
    .withMessage('Message content cannot be empty')
    .isLength({ max: 5000 })
    .withMessage('Message content cannot exceed 5000 characters'),
  body('context')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Context cannot exceed 1000 characters'),
];