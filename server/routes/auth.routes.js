import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { signup, verifyEmailController, resendVerificationController } from '../controllers/auth.controller.js';

const authRoutes = Router();

// Rate limiting for resending verification
const resendLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 resend requests per hour
    message: { message: 'Too many resend requests, please try again after an hour' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting for signup to prevent brute-force/DoS
const signupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 signup requests per window
    message: { message: 'Too many accounts created from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

const signupValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ max: 100 }).withMessage('Name must be under 100 characters')
        .escape(),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('passwordConfirmation')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Password confirmation does not match password');
            }
            return true;
        }),
];

authRoutes.post('/signup', signupLimiter, signupValidation, signup);

authRoutes.get("/verify-email",verifyEmailController )

authRoutes.post("/resend-verification", resendLimiter, resendVerificationController)


export default authRoutes;
