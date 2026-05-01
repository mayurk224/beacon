import rateLimit from 'express-rate-limit';
import config from '../config/config.js';

/**
 * Creates a rate limiter middleware for signup requests.
 * Limits IPs to 10 signup attempts per 15 minutes.
 */
export const signupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: config.NODE_ENV === 'test' ? 100 : 10, // Higher limit for tests
    message: { message: 'Too many accounts created from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Creates a rate limiter middleware for login requests.
 * Limits IPs to 5 login attempts per 15 minutes.
 */
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: config.NODE_ENV === 'test' ? 100 : 5, // Higher limit for tests
    message: { message: 'Too many login attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * General purpose rate limiter can be added here as well.
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: config.NODE_ENV === 'test' ? 1000 : 100,
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});
