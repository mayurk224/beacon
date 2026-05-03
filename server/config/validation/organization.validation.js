import { body, param } from 'express-validator';

export const createOrganizationValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Organization name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Organization name must be between 2 and 100 characters')
        .escape(),
];

export const getOrganizationByIdValidation = [
    param('id')
        .trim()
        .notEmpty().withMessage('Organization ID is required')
        .isMongoId().withMessage('Invalid Organization ID format'),
];

export const sendInviteValidation = [
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

export const acceptInviteValidation = [
    body('token')
        .trim()
        .notEmpty().withMessage('Invite token is required')
        .isLength({ min: 64, max: 64 }).withMessage('Invalid token format'),
];

export const updateMemberRoleValidation = [
    param('orgId')
        .isMongoId().withMessage('Invalid Organization ID format'),
    param('userId')
        .isMongoId().withMessage('Invalid User ID format'),
    body('role')
        .trim()
        .notEmpty().withMessage('Role is required')
        .isIn(['admin', 'responder', 'viewer']).withMessage('Invalid role specified'),
];

export const removeMemberValidation = [
    param('orgId')
        .isMongoId().withMessage('Invalid Organization ID format'),
    param('userId')
        .isMongoId().withMessage('Invalid User ID format'),
];

export const updateOrganizationValidation = [
    param('id')
        .isMongoId().withMessage('Invalid Organization ID format'),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Organization name must be between 2 and 100 characters')
        .escape(),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
        .escape(),
];
