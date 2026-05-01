import { Router } from 'express';
import { login, signup, logout, refreshToken, verifyEmail, forgotPassword, resetPassword, getMe } from '../controllers/auth.controller.js';
import { loginValidation, signupValidation, verifyEmailValidation, forgotPasswordValidation, resetPasswordValidation } from '../config/validation/auth.validation.js';
import { signupLimiter, loginLimiter, forgotPasswordLimiter } from '../utils/rateLimiter.js';
import { protect } from '../middleware/auth.middleware.js';

const authRoutes = Router();

authRoutes.post('/signup', signupLimiter, signupValidation, signup);
authRoutes.post('/login', loginLimiter, loginValidation, login);
authRoutes.post('/logout', logout);
authRoutes.post('/refresh-token', refreshToken);
authRoutes.get('/verify-email', verifyEmailValidation, verifyEmail);
authRoutes.post('/verify-email', verifyEmailValidation, verifyEmail);
authRoutes.post('/forgot-password', forgotPasswordLimiter, forgotPasswordValidation, forgotPassword);
authRoutes.post('/reset-password', resetPasswordValidation, resetPassword);
authRoutes.get('/me', protect, getMe);

export default authRoutes;
