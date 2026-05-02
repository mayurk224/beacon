import { body } from 'express-validator';

export const createOrganizationValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Organization name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Organization name must be between 2 and 100 characters')
        .escape(),
];

export const addUserToOrganizationValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('User email is required')
        .isEmail().withMessage('Must be a valid email address')
        .normalizeEmail(),
    body('role')
        .optional()
        .isIn(['admin', 'responder', 'viewer']).withMessage('Invalid role specified'),
    body('organizationId')
        .trim()
        .notEmpty().withMessage('Organization ID is required')
        .isMongoId().withMessage('Invalid Organization ID format'),
];
