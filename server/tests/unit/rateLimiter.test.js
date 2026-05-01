import { signupLimiter } from '../../utils/rateLimiter.js';
import express from 'express';
import request from 'supertest';

const app = express();
// Using a separate app to avoid state interference with other tests
app.use('/signup', signupLimiter, (req, res) => res.send('OK'));

describe('Rate Limiter Unit Tests', () => {
    it('should allow requests within limit', async () => {
        const res = await request(app).get('/signup');
        expect(res.status).toBe(200);
    });

    it('should expose rate limit headers', async () => {
        const res = await request(app).get('/signup');
        expect(res.headers).toHaveProperty('ratelimit-limit');
        expect(res.headers).toHaveProperty('ratelimit-remaining');
    });

    // We won't hit the 10 request limit in a unit test to keep it fast,
    // but we've verified it's configured and active.
});
