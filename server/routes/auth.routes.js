import { Router } from 'express';
import {
    login,
    signup,
    logout,
    refreshToken,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getMe,
    resendVerificationController,
    googleAuth
} from '../controllers/auth.controller.js';
import {
    loginValidation,
    signupValidation,
    forgotPasswordValidation,
    resetPasswordValidation
} from '../config/validation/auth.validation.js';
import {
    signupLimiter,
    loginLimiter,
    forgotPasswordLimiter,
    resendLimiter
} from '../utils/rateLimiter.js';
import { protect } from '../middleware/auth.middleware.js';

const authRoutes = Router();

// --- Registration & Login ---
authRoutes.post('/signup', signupLimiter, signupValidation, signup);
authRoutes.post('/login', loginLimiter, loginValidation, login);
authRoutes.post('/logout', logout);

// --- Token Management ---
authRoutes.post('/refresh-token', refreshToken);

// --- Email Verification ---
// Unified endpoint for email verification (handles GET link clicks)
authRoutes.get('/verify-email', verifyEmail);
// Resend verification email
authRoutes.post('/resend-verification', resendLimiter, resendVerificationController);

// --- Password Recovery ---
authRoutes.post('/forgot-password', forgotPasswordLimiter, forgotPasswordValidation, forgotPassword);
authRoutes.post('/reset-password', resetPasswordValidation, resetPassword);

// --- User Profile ---
authRoutes.get('/me', protect, getMe);
authRoutes.post('/google', googleAuth);

export default authRoutes;
