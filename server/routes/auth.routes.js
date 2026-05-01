import { Router } from 'express';
import { login, signup, logout, refreshToken, verifyEmail, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { loginValidation, signupValidation, verifyEmailValidation, forgotPasswordValidation, resetPasswordValidation } from '../config/validation/auth.validation.js';
import { signupLimiter, loginLimiter, forgotPasswordLimiter } from '../utils/rateLimiter.js';

const authRoutes = Router();

authRoutes.post('/signup', signupLimiter, signupValidation, signup);
authRoutes.post('/login', loginLimiter, loginValidation, login);
authRoutes.post('/logout', logout);
authRoutes.post('/refresh-token', refreshToken);
authRoutes.post('/verify-email', verifyEmailValidation, verifyEmail);
authRoutes.post('/forgot-password', forgotPasswordLimiter, forgotPasswordValidation, forgotPassword);
authRoutes.post('/reset-password', resetPasswordValidation, resetPassword);

export default authRoutes;
