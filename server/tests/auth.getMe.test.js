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
    await mongoServer.stop();
});

beforeEach(async () => {
    await userModel.deleteMany({});
});

describe('GET /api/auth/me', () => {
    const testUser = {
        name: 'Test Me',
        email: 'me@example.com',
        password: 'Password123!',
        isVerified: true
    };

    const createToken = (userId) => {
        return jwt.sign({ userId }, config.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    };

    it('should return user profile for a valid token', async () => {
        const user = await userModel.create(testUser);
        const token = createToken(user._id);

        const res = await request(app)
            .get('/api/auth/me')
            .set('Cookie', [`accessToken=${token}`]);

        expect(res.statusCode).toEqual(200);
        expect(res.body.user).toHaveProperty('email', testUser.email);
        expect(res.body.user).toHaveProperty('name', testUser.name);
        expect(res.body.user).not.toHaveProperty('password');
        expect(res.body.user).not.toHaveProperty('refreshTokens');
        expect(res.body.user).not.toHaveProperty('passwordResetToken');
    });

    it('should return 401 if no token is provided', async () => {
        const res = await request(app)
            .get('/api/auth/me');

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('message', 'Unauthorized');
    });

    it('should return 401 if token is invalid', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Cookie', ['accessToken=invalid-token']);

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('message', 'Invalid or expired token');
    });

    it('should return 404 if user no longer exists', async () => {
        const userId = new mongoose.Types.ObjectId();
        const token = createToken(userId);

        const res = await request(app)
            .get('/api/auth/me')
            .set('Cookie', [`accessToken=${token}`]);

        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('message', 'User not found');
    });

    it('should return 401 if token is expired', async () => {
        const user = await userModel.create(testUser);
        // Create an already expired token
        const expiredToken = jwt.sign(
            { userId: user._id },
            config.ACCESS_TOKEN_SECRET,
            { expiresIn: '-1s' }
        );

        const res = await request(app)
            .get('/api/auth/me')
            .set('Cookie', [`accessToken=${expiredToken}`]);

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('message', 'Invalid or expired token');
    });
});
