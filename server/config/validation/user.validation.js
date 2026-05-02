import { body } from 'express-validator';

export const updateProfileValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
        .escape(),

    body('avatar')
        .optional()
        .trim()
        .isURL().withMessage('Avatar must be a valid URL'),

    body('preferences.theme')
        .optional()
        .isIn(['light', 'dark']).withMessage('Theme must be either light or dark'),

    body('preferences.notifications.email')
        .optional()
        .isBoolean().withMessage('Email notification preference must be a boolean'),

    body('preferences.notifications.sms')
        .optional()
        .isBoolean().withMessage('SMS notification preference must be a boolean'),

    body('preferences.notifications.slack')
        .optional()
        .isBoolean().withMessage('Slack notification preference must be a boolean'),
];

export const changePasswordValidation = [
    body('currentPassword')
        .notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];
