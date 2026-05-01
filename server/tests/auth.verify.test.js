import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import userModel from '../models/user.model.js';
import crypto from 'crypto';

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

describe('Email Verification API', () => {
  const setupTestUser = async (tokenOverrides = {}) => {
    const token = crypto.randomBytes(32).toString('hex');
    const user = await userModel.create({
      name: 'Verify Test',
      email: 'verify@example.com',
      password: 'Password123!',
      emailVerificationToken: token,
      emailVerificationExpires: Date.now() + 1000 * 60 * 60, // 1 hour
      ...tokenOverrides
    });
    return { user, token };
  };

  it('should verify email successfully with a valid token', async () => {
    const { token } = await setupTestUser();

    const res = await request(app)
      .post(`/api/auth/verify-email?token=${token}`)
      .send();

    // The current implementation redirects
    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toContain('/email-verified');

    const updatedUser = await userModel.findOne({ email: 'verify@example.com' });
    expect(updatedUser.isEmailVerified).toBe(true);
    expect(updatedUser.emailVerificationToken).toBeUndefined();
    expect(updatedUser.emailVerificationExpires).toBeUndefined();
  });

  it('should fail if token is missing', async () => {
    const res = await request(app)
      .post('/api/auth/verify-email')
      .send();

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('Validation failed');
    expect(res.body.errors.some(e => e.field === 'token')).toBeTruthy();
  });

  it('should fail if token is invalid format', async () => {
    await setupTestUser();

    const res = await request(app)
      .post('/api/auth/verify-email?token=too-short')
      .send();

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('Validation failed');
    expect(res.body.errors.some(e => e.field === 'token')).toBeTruthy();
  });

  it('should fail if token is expired', async () => {
    const { token } = await setupTestUser({
      emailVerificationExpires: Date.now() - 1000 // Expired 1 second ago
    });

    const res = await request(app)
      .post(`/api/auth/verify-email?token=${token}`)
      .send();

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('Token invalid or expired');
  });

  it('should protect against NoSQL injection via token query param', async () => {
    await setupTestUser();

    const res = await request(app)
      .post('/api/auth/verify-email')
      .query({ 'token[$ne]': 'null' })
      .send();

    expect(res.statusCode).toEqual(400);
    // Should fail validation because 'token' is missing or in wrong format
  });

  it('should set an access token cookie on success', async () => {
    const { token } = await setupTestUser();

    const res = await request(app)
      .post(`/api/auth/verify-email?token=${token}`)
      .send();

    expect(res.statusCode).toEqual(302);
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toContain('accessToken');
  });
});
