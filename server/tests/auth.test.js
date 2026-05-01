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
