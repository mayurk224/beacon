import { Router } from 'express';
import { login, signup, logout, refreshToken } from '../controllers/auth.controller.js';
import { loginValidation, signupValidation } from '../config/validation/auth.validation.js';
import { signupLimiter, loginLimiter } from '../utils/rateLimiter.js';

const authRoutes = Router();

authRoutes.post('/signup', signupLimiter, signupValidation, signup);
authRoutes.post('/login', loginLimiter, loginValidation, login);
authRoutes.post('/logout', logout);
authRoutes.post('/refresh-token', refreshToken);

export default authRoutes;
