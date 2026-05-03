import { param } from 'express-validator';

export const notificationIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid notification ID format'),
];