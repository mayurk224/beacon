import { signupValidation } from '../../config/validation/auth.validation.js';
import express from 'express';
import request from 'supertest';
import { validationResult } from 'express-validator';

const app = express();
app.use(express.json());

app.post('/test-validation', signupValidation, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    res.status(200).json({ message: 'Success' });
});

describe('Auth Validation Unit Tests', () => {
    it('should pass with valid data', async () => {
        const res = await request(app)
            .post('/test-validation')
            .send({
                name: 'John Doe',
                email: 'john@example.com',
                password: 'Password123!',
                passwordConfirmation: 'Password123!',
            });
        expect(res.status).toBe(200);
    });

    it('should fail with missing name', async () => {
        const res = await request(app)
            .post('/test-validation')
            .send({
                email: 'john@example.com',
                password: 'Password123!',
                passwordConfirmation: 'Password123!',
            });
        expect(res.status).toBe(400);
        expect(res.body.errors.some(e => e.path === 'name')).toBeTruthy();
    });

    it('should fail with invalid email', async () => {
        const res = await request(app)
            .post('/test-validation')
            .send({
                name: 'John Doe',
                email: 'invalid-email',
                password: 'Password123!',
                passwordConfirmation: 'Password123!',
            });
        expect(res.status).toBe(400);
        expect(res.body.errors.some(e => e.path === 'email')).toBeTruthy();
    });

    it('should fail with weak password', async () => {
        const res = await request(app)
            .post('/test-validation')
            .send({
                name: 'John Doe',
                email: 'john@example.com',
                password: '123',
                passwordConfirmation: '123',
            });
        expect(res.status).toBe(400);
        expect(res.body.errors.some(e => e.path === 'password')).toBeTruthy();
    });

    it('should fail if passwords do not match', async () => {
        const res = await request(app)
            .post('/test-validation')
            .send({
                name: 'John Doe',
                email: 'john@example.com',
                password: 'Password123!',
                passwordConfirmation: 'WrongPassword123!',
            });
        expect(res.status).toBe(400);
        expect(res.body.errors.some(e => e.msg === 'Password confirmation does not match password')).toBeTruthy();
    });
});
