import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import userModel from '../models/user.model.js';

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

describe('POST /api/auth/signup', () => {
  const validUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123!',
    passwordConfirmation: 'Password123!',
  };

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(validUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'Account created successfully. Please verify your email.');
    expect(res.body.user).toHaveProperty('email', 'test@example.com');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('should fail if passwords do not match', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ ...validUser, passwordConfirmation: 'WrongPass123!' });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('Validation failed');
    expect(res.body.errors[0].message).toEqual('Password confirmation does not match password');
  });

  it('should fail for weak password', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ ...validUser, password: '123', passwordConfirmation: '123' });

    expect(res.statusCode).toEqual(400);
    expect(res.body.errors.some(e => e.field === 'password')).toBeTruthy();
  });

  it('should fail for duplicate email', async () => {
    await request(app).post('/api/auth/signup').send(validUser);

    const res = await request(app)
      .post('/api/auth/signup')
      .send(validUser);

    expect(res.statusCode).toEqual(409);
    expect(res.body.message).toEqual('User with this email already exists');
  });

  it('should handle invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ ...validUser, email: 'invalid-email' });

    expect(res.statusCode).toEqual(400);
    expect(res.body.errors.some(e => e.field === 'email')).toBeTruthy();
  });

  it('should protect against NoSQL injection', async () => {
    // Attempting injection via $gt in email
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ ...validUser, email: { $gt: "" } });

    // mongoSanitize should have removed the $gt, 
    // or express-validator should have failed email validation
    expect(res.statusCode).toEqual(400);
  });
});

describe('GET /api/auth/verify-email', () => {
  it('should verify email successfully with valid token', async () => {
    // Create a user with a token
    const user = await userModel.create({
      name: 'Verify User',
      email: 'verify@example.com',
      password: 'HashedPassword123!',
      emailVerificationToken: 'valid-token',
      emailVerificationExpires: Date.now() + 3600000,
      isEmailVerified: false,
    });

    const res = await request(app)
      .get('/api/auth/verify-email')
      .query({ token: 'valid-token' });

    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Email Verified');

    const updatedUser = await userModel.findById(user._id);
    expect(updatedUser.isEmailVerified).toBe(true);
    // Note: We now keep the token for reload handling, but clear the expiry
    expect(updatedUser.emailVerificationExpires).toBeUndefined();
  });

  it('should handle reloads by showing "Already Verified"', async () => {
    const user = await userModel.create({
      name: 'Reload User',
      email: 'reload@example.com',
      password: 'HashedPassword123!',
      emailVerificationToken: 'reload-token',
      isEmailVerified: true, // Already verified
    });

    const res = await request(app)
      .get('/api/auth/verify-email')
      .query({ token: 'reload-token' });

    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Already Verified');
  });

  it('should fail with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/verify-email')
      .query({ token: 'invalid-token' });

    expect(res.statusCode).toEqual(404);
    expect(res.text).toContain('Link Expired');
  });

  it('should fail with expired token', async () => {
    await userModel.create({
      name: 'Expired User',
      email: 'expired@example.com',
      password: 'HashedPassword123!',
      emailVerificationToken: 'expired-token',
      emailVerificationExpires: Date.now() - 3600000,
      isEmailVerified: false,
    });

    const res = await request(app)
      .get('/api/auth/verify-email')
      .query({ token: 'expired-token' });

    expect(res.statusCode).toEqual(404);
    expect(res.text).toContain('Link Expired');
  });
});

describe('POST /api/auth/resend-verification', () => {
  it('should resend verification email successfully', async () => {
    await userModel.create({
      name: 'Resend User',
      email: 'resend@example.com',
      password: 'HashedPassword123!',
      isEmailVerified: false,
    });

    const res = await request(app)
      .post('/api/auth/resend-verification')
      .send({ email: 'resend@example.com' });

    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Email Sent');

    const updatedUser = await userModel.findOne({ email: 'resend@example.com' });
    expect(updatedUser.emailVerificationToken).not.toBeNull();
  });

  it('should fail if email not found', async () => {
    const res = await request(app)
      .post('/api/auth/resend-verification')
      .send({ email: 'nonexistent@example.com' });

    expect(res.statusCode).toEqual(404);
    expect(res.text).toContain('User Not Found');
  });
});
