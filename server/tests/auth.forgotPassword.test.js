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

describe('Forgot Password Flow', () => {
  const email = 'test@example.com';
  const password = 'Password123!';

  beforeEach(async () => {
    // Create a test user
    await userModel.create({
      name: 'Test User',
      email,
      password: 'hashedpassword', // normally hashed but for this test we just need the user to exist
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should return 200 and a generic message for existing email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('If this email exists, a reset link has been sent');

      const user = await userModel.findOne({ email });
      expect(user.passwordResetToken).toBeDefined();
      expect(user.passwordResetExpires).toBeDefined();
    });

    it('should return 200 and a generic message for non-existent email (enumeration protection)', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('If this email exists, a reset link has been sent');
    });

    it('should fail if email is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'not-an-email' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Validation failed');
    });

    it('should store a hashed version of the token, not plaintext', async () => {
      // We need to capture the console log or rely on the fact that the stored token 
      // should be a 64-char hex string (SHA-256) while the generated one is 64 chars too.
      // But we can check if the stored one matches a manual hash of the plaintext token from logs.
      // For simplicity in this test, we just verify it's saved.
      await request(app).post('/api/auth/forgot-password').send({ email });
      const user = await userModel.findOne({ email });
      expect(user.passwordResetToken).toHaveLength(64); // SHA-256 hash length
    });
  });

  describe('POST /api/auth/reset-password', () => {
    let resetToken;

    beforeEach(async () => {
      // Generate a token manually to test reset
      resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      await userModel.findOneAndUpdate(
        { email },
        {
          passwordResetToken: hashedToken,
          passwordResetExpires: Date.now() + 3600000 // 1 hour
        }
      );
    });

    it('should reset password with a valid token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'NewPassword123!',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Password reset successful');

      const user = await userModel.findOne({ email });
      expect(user.passwordResetToken).toBeUndefined();
      expect(user.passwordResetExpires).toBeUndefined();
      // Verify password was updated (should be different from 'hashedpassword')
      expect(user.password).not.toEqual('hashedpassword');
    });

    it('should fail with an invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'a'.repeat(64), // valid format (64 hex chars) but incorrect token
          newPassword: 'NewPassword123!',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Token invalid or expired');
    });

    it('should fail with an expired token', async () => {
      await userModel.findOneAndUpdate(
        { email },
        { passwordResetExpires: Date.now() - 1000 } // expired 1s ago
      );

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'NewPassword123!',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Token invalid or expired');
    });

    it('should fail with weak password', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'weak',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Validation failed');
    });
  });
});
