import { body } from 'express-validator';

export const updateBusinessValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Business name must be between 1-100 characters'),
  body('supportEmail')
    .optional()
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Support email must be valid'),
  body('knowledge')
    .optional()
    .isString()
    .isLength({ max: 10000 })
    .withMessage('Knowledge base cannot exceed 10,000 characters'),
  body('faqs')
    .optional()
    .isArray()
    .withMessage('FAQs must be an array'),
  body('faqs.*.question')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('FAQ question must be 1-200 characters'),
  body('faqs.*.answer')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('FAQ answer must be 1-1000 characters'),
  body('appearance.botName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Bot name must be 1-50 characters'),
  body('appearance.primaryColor')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Primary color must be a valid hex color'),
  body('appearance.secondaryColor')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Secondary color must be a valid hex color'),
];

export const scrapeAndTrainValidator = [
  body('url')
    .trim()
    .notEmpty()
    .withMessage('URL is required')
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: false
    })
    .withMessage('Must be a valid URL')
    .isLength({ max: 2000 })
    .withMessage('URL cannot exceed 2000 characters'),
];