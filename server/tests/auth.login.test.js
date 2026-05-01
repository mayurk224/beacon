import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import app from '../src/app.js';
import userModel from '../models/user.model.js';

let mongoServer;

beforeAll(async () => {
  process.env.ACCESS_TOKEN_SECRET = 'test-secret';
  process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
  process.env.NODE_ENV = 'test';
  mongoServer = await MongoMemoryServer.create();
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

describe('POST /api/auth/login', () => {
  const password = 'Password123!';
  const email = 'test@example.com';

  const createTestUser = async (overrides = {}) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return await userModel.create({
      name: 'Test User',
      email,
      password: hashedPassword,
      isActive: true,
      isEmailVerified: true,
      ...overrides
    });
  };

  it('should login successfully with correct credentials', async () => {
    await createTestUser();

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Login successful');
    expect(res.body.user).toHaveProperty('email', email);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should fail with invalid password', async () => {
    await createTestUser();

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'WrongPassword123!' });

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Invalid credentials');
  });

  it('should fail with non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password });

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Invalid credentials');
  });

  it('should lock the account after 5 failed attempts', async () => {
    await createTestUser();

    // 5 failed attempts
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'WrongPassword123!' });
    }

    // 6th attempt should be locked
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'WrongPassword123!' });

    expect(res.statusCode).toEqual(423);
    expect(res.body.message).toEqual('Account is temporarily locked. Please try again later.');

    // Even with correct password, it should still be locked
    const resCorrect = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

    expect(resCorrect.statusCode).toEqual(423);
  });

  it('should fail if account is disabled', async () => {
    await createTestUser({ isActive: false });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

    expect(res.statusCode).toEqual(403);
    expect(res.body.message).toEqual('Account is disabled');
  });

  it('should fail if email is not verified', async () => {
    await createTestUser({ isEmailVerified: false });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

    expect(res.statusCode).toEqual(403);
    expect(res.body.message).toEqual('Please verify your email before logging in');
  });

  it('should protect against NoSQL injection in email', async () => {
    await createTestUser();

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: { $gt: "" }, password });

    // express-validator should fail email validation
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('Validation failed');
  });

  it('should fail for missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('Validation failed');
  });
});
