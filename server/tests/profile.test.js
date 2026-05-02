import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import userModel from '../models/user.model.js';
import config from '../config/config.js';

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({
        instance: {
            launchTimeoutMS: 60000,
        }
    });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
}, 120000);

afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
});

beforeEach(async () => {
    await userModel.deleteMany({});
});

describe('GET /api/users/profile', () => {
    const generateToken = (userId) => {
        return jwt.sign({ userId }, config.ACCESS_TOKEN_SECRET || 'test_secret', {
            expiresIn: '15m',
        });
    };

    it('should return user profile with valid token', async () => {
        const user = await userModel.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            isEmailVerified: true,
            isActive: true,
        });

        const token = generateToken(user._id);

        const res = await request(app)
            .get('/api/users/profile')
            .set('Cookie', [`accessToken=${token}`]);

        expect(res.statusCode).toEqual(200);
        expect(res.body.user).toHaveProperty('name', 'John Doe');
        expect(res.body.user).toHaveProperty('email', 'john@example.com');
        expect(res.body.user).not.toHaveProperty('password');
        expect(res.body.user).not.toHaveProperty('refreshTokens');

        // Check security headers
        expect(res.headers).toHaveProperty('x-dns-prefetch-control');
        expect(res.headers).toHaveProperty('x-frame-options');
        expect(res.headers).toHaveProperty('content-security-policy');
    });

    it('should return 401 if token is missing', async () => {
        const res = await request(app).get('/api/users/profile');
        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toEqual('Unauthorized');
    });

    it('should return 401 if token is invalid', async () => {
        const res = await request(app)
            .get('/api/users/profile')
            .set('Cookie', ['accessToken=invalid_token']);

        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toEqual('Invalid or expired token');
    });

    it('should return 404 if user no longer exists', async () => {
        const userId = new mongoose.Types.ObjectId();
        const token = generateToken(userId);

        const res = await request(app)
            .get('/api/users/profile')
            .set('Cookie', [`accessToken=${token}`]);

        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual('User not found');
    });

    it('should return 403 if account is deactivated', async () => {
        const user = await userModel.create({
            name: 'Inactive User',
            email: 'inactive@example.com',
            password: 'password123',
            isActive: false,
        });

        const token = generateToken(user._id);

        const res = await request(app)
            .get('/api/users/profile')
            .set('Cookie', [`accessToken=${token}`]);

        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toEqual('Account is deactivated');
    });
});

describe('PATCH /api/users/profile', () => {
    const generateToken = (userId) => {
        return jwt.sign({ userId }, config.ACCESS_TOKEN_SECRET || 'test_secret', {
            expiresIn: '15m',
        });
    };

    it('should update profile successfully', async () => {
        const user = await userModel.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            isActive: true,
        });

        const token = generateToken(user._id);

        const res = await request(app)
            .patch('/api/users/profile')
            .set('Cookie', [`accessToken=${token}`])
            .send({
                name: 'Jane Doe',
                preferences: {
                    theme: 'light',
                    notifications: {
                        email: false,
                        slack: true
                    }
                }
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.user.name).toEqual('Jane Doe');
        expect(res.body.user.preferences.theme).toEqual('light');
        expect(res.body.user.preferences.notifications.email).toEqual(false);
        expect(res.body.user.preferences.notifications.slack).toEqual(true);
        expect(res.body.user.preferences.notifications.sms).toEqual(false); // default
    });

    it('should update avatar successfully', async () => {
        const user = await userModel.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            isActive: true,
        });

        const token = generateToken(user._id);
        const avatarUrl = 'https://example.com/avatar.png';

        const res = await request(app)
            .patch('/api/users/profile')
            .set('Cookie', [`accessToken=${token}`])
            .send({ avatar: avatarUrl });

        expect(res.statusCode).toEqual(200);
        expect(res.body.user.avatar).toEqual(avatarUrl);
    });

    it('should return 400 for invalid name', async () => {
        const user = await userModel.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            isActive: true,
        });

        const token = generateToken(user._id);

        const res = await request(app)
            .patch('/api/users/profile')
            .set('Cookie', [`accessToken=${token}`])
            .send({ name: 'J' }); // too short

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('Validation failed');
        expect(res.body.errors[0].field).toEqual('name');
    });

    it('should return 400 for invalid theme', async () => {
        const user = await userModel.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            isActive: true,
        });

        const token = generateToken(user._id);

        const res = await request(app)
            .patch('/api/users/profile')
            .set('Cookie', [`accessToken=${token}`])
            .send({ preferences: { theme: 'blue' } });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('Validation failed');
    });

    it('should return 400 if no valid fields provided', async () => {
        const user = await userModel.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            isActive: true,
        });

        const token = generateToken(user._id);

        const res = await request(app)
            .patch('/api/users/profile')
            .set('Cookie', [`accessToken=${token}`])
            .send({ invalidField: 'test' });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('No valid fields to update');
    });

    it('should return 403 if account is deactivated', async () => {
        const user = await userModel.create({
            name: 'Inactive User',
            email: 'inactive@example.com',
            password: 'password123',
            isActive: false,
        });

        const token = generateToken(user._id);

        const res = await request(app)
            .patch('/api/users/profile')
            .set('Cookie', [`accessToken=${token}`])
            .send({ name: 'New Name' });

        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toEqual('Account is deactivated');
    });
});
