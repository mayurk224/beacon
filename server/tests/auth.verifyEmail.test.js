import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import crypto from 'crypto';
import app from '../src/app.js';
import userModel from '../models/user.model.js';

let mongoServer;

beforeAll(async () => {
  process.env.ACCESS_TOKEN_SECRET = 'test-secret';
  process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
  process.env.NODE_ENV = 'test';
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

describe('Email Verification Flow (Backward Compatibility)', () => {
  const email = 'test@example.com';
  let verificationToken;

  beforeEach(async () => {
    verificationToken = crypto.randomBytes(32).toString('hex');
    await userModel.create({
      name: 'Test User',
      email,
      password: 'Password123!',
      emailVerificationToken: verificationToken,
      emailVerificationExpires: Date.now() + 3600000, // 1 hour
    });
  });

  it('should verify email via GET request (Backward Compatibility)', async () => {
    const res = await request(app)
      .get(`/api/auth/verify-email?token=${verificationToken}`);

    // The controller redirects to frontend on success
    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toContain('/email-verified');

    const user = await userModel.findOne({ email });
    expect(user.isEmailVerified).toBe(true);
    expect(user.emailVerificationToken).toBeUndefined();
  });

  it('should verify email via POST request', async () => {
    const res = await request(app)
      .post('/api/auth/verify-email')
      .send({ token: verificationToken });

    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toContain('/email-verified');

    const user = await userModel.findOne({ email });
    expect(user.isEmailVerified).toBe(true);
  });

  it('should fail if token is missing in both GET and POST', async () => {
    const resGet = await request(app).get('/api/auth/verify-email');
    expect(resGet.statusCode).toEqual(400);

    const resPost = await request(app).post('/api/auth/verify-email').send({});
    expect(resPost.statusCode).toEqual(400);
  });

  it('should fail with invalid token format', async () => {
    const res = await request(app)
      .get('/api/auth/verify-email?token=short');
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('Validation failed');
  });
});
