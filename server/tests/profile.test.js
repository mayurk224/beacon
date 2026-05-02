import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import userModel from '../models/user.model.js';
import config from '../config/config.js';
import { imagekit } from '../config/imagekit.js';

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

describe('POST /api/users/profile/avatar', () => {
    const generateToken = (userId) => {
        return jwt.sign({ userId }, config.ACCESS_TOKEN_SECRET || 'test_secret', {
            expiresIn: '15m',
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should upload avatar successfully', async () => {
        const user = await userModel.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            isActive: true,
        });

        const token = generateToken(user._id);
        const mockUrl = 'https://ik.imagekit.io/test/avatar.jpg';

        const uploadSpy = jest.spyOn(imagekit, 'upload').mockResolvedValue({
            url: mockUrl,
            fileId: 'test_id'
        });

        const res = await request(app)
            .post('/api/users/profile/avatar')
            .set('Cookie', [`accessToken=${token}`])
            .attach('avatar', Buffer.from('fake-image-content'), 'avatar.jpg');

        expect(res.statusCode).toEqual(200);
        expect(res.body.avatar).toEqual(mockUrl);
        expect(res.body.user.avatar).toEqual(mockUrl);
        expect(res.body.user.avatarFileId).toEqual('test_id');
        expect(uploadSpy).toHaveBeenCalled();

        uploadSpy.mockRestore();
    });

    it('should cleanup old avatar when uploading a new one', async () => {
        const user = await userModel.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            isActive: true,
            avatarFileId: 'old_file_id'
        });

        const token = generateToken(user._id);
        const mockUrl = 'https://ik.imagekit.io/test/new_avatar.jpg';

        const uploadSpy = jest.spyOn(imagekit, 'upload').mockResolvedValue({
            url: mockUrl,
            fileId: 'new_file_id'
        });
        const deleteSpy = jest.spyOn(imagekit, 'deleteFile').mockResolvedValue({});

        const res = await request(app)
            .post('/api/users/profile/avatar')
            .set('Cookie', [`accessToken=${token}`])
            .attach('avatar', Buffer.from('fake-image-content'), 'avatar.jpg');

        expect(res.statusCode).toEqual(200);
        expect(res.body.user.avatarFileId).toEqual('new_file_id');
        expect(deleteSpy).toHaveBeenCalledWith('old_file_id');

        uploadSpy.mockRestore();
        deleteSpy.mockRestore();
    });

    it('should return 400 if no file is uploaded', async () => {
        const user = await userModel.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            isActive: true,
        });

        const token = generateToken(user._id);

        const res = await request(app)
            .post('/api/users/profile/avatar')
            .set('Cookie', [`accessToken=${token}`]);

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('No file uploaded');
    });

    it('should return 400 for invalid file type', async () => {
        const user = await userModel.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            isActive: true,
        });

        const token = generateToken(user._id);

        const res = await request(app)
            .post('/api/users/profile/avatar')
            .set('Cookie', [`accessToken=${token}`])
            .attach('avatar', Buffer.from('fake-text-content'), 'test.txt');

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toMatch(/Only image files/);
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
            .post('/api/users/profile/avatar')
            .set('Cookie', [`accessToken=${token}`])
            .attach('avatar', Buffer.from('fake-image-content'), 'avatar.jpg');

        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toEqual('Account is deactivated');
    });

    it('should handle ImageKit upload failure', async () => {
        const user = await userModel.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            isActive: true,
        });

        const token = generateToken(user._id);

        const uploadSpy = jest.spyOn(imagekit, 'upload').mockRejectedValue(new Error('ImageKit error'));

        const res = await request(app)
            .post('/api/users/profile/avatar')
            .set('Cookie', [`accessToken=${token}`])
            .attach('avatar', Buffer.from('fake-image-content'), 'avatar.jpg');

        expect(res.statusCode).toEqual(502);
        expect(res.body.message).toEqual('Image storage service error');

        uploadSpy.mockRestore();
    });
});

describe('DELETE /api/users/profile/avatar', () => {
    const generateToken = (userId) => {
        return jwt.sign({ userId }, config.ACCESS_TOKEN_SECRET || 'test_secret', {
            expiresIn: '15m',
        });
    };

    it('should delete avatar successfully and NOT leak tokens', async () => {
        const user = await userModel.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            isActive: true,
            avatar: 'https://example.com/avatar.jpg',
            avatarFileId: 'test_file_id',
            refreshTokens: [{ token: 'secret_refresh_token' }]
        });

        const token = generateToken(user._id);
        const deleteSpy = jest.spyOn(imagekit, 'deleteFile').mockResolvedValue({});

        const res = await request(app)
            .delete('/api/users/profile/avatar')
            .set('Cookie', [`accessToken=${token}`]);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Avatar removed successfully');
        expect(res.body.user.avatar).toEqual('');
        expect(res.body.user).not.toHaveProperty('password');
        expect(res.body.user).not.toHaveProperty('refreshTokens');
        expect(res.body.user).not.toHaveProperty('passwordResetToken');

        expect(deleteSpy).toHaveBeenCalledWith('test_file_id');
        deleteSpy.mockRestore();
    });

    it('should return 404 if user not found', async () => {
        const userId = new mongoose.Types.ObjectId();
        const token = generateToken(userId);

        const res = await request(app)
            .delete('/api/users/profile/avatar')
            .set('Cookie', [`accessToken=${token}`]);

        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual('User not found');
    });
});

describe('POST /api/users/profile/password', () => {
    const generateToken = (userId) => {
        return jwt.sign({ userId }, config.ACCESS_TOKEN_SECRET || 'test_secret', {
            expiresIn: '15m',
        });
    };

    it('should change password successfully with valid inputs', async () => {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash('OldPassword123!', salt);
        const user = await userModel.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: hashedPassword,
            isActive: true,
            refreshTokens: [{ token: 'some_refresh_token' }]
        });

        const token = generateToken(user._id);

        const res = await request(app)
            .post('/api/users/profile/password')
            .set('Cookie', [`accessToken=${token}`])
            .send({
                currentPassword: 'OldPassword123!',
                newPassword: 'NewPassword123@'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toMatch(/Password changed successfully/);

        const updatedUser = await userModel.findById(user._id);
        expect(updatedUser.refreshTokens).toHaveLength(0);
        const isMatch = await bcrypt.compare('NewPassword123@', updatedUser.password);
        expect(isMatch).toBe(true);
    });

    it('should return 400 for weak new password', async () => {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash('OldPassword123!', salt);
        const user = await userModel.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: hashedPassword,
            isActive: true,
        });

        const token = generateToken(user._id);

        const res = await request(app)
            .post('/api/users/profile/password')
            .set('Cookie', [`accessToken=${token}`])
            .send({
                currentPassword: 'OldPassword123!',
                newPassword: 'weak'
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('Validation failed');
    });

    it('should return 401 for incorrect current password', async () => {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash('OldPassword123!', salt);
        const user = await userModel.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: hashedPassword,
            isActive: true,
        });

        const token = generateToken(user._id);

        const res = await request(app)
            .post('/api/users/profile/password')
            .set('Cookie', [`accessToken=${token}`])
            .send({
                currentPassword: 'WrongPassword!',
                newPassword: 'NewPassword123@'
            });

        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toEqual('Current password is incorrect');
    });

    it('should return 400 when new password is same as current', async () => {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash('OldPassword123!', salt);
        const user = await userModel.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: hashedPassword,
            isActive: true,
        });

        const token = generateToken(user._id);

        const res = await request(app)
            .post('/api/users/profile/password')
            .set('Cookie', [`accessToken=${token}`])
            .send({
                currentPassword: 'OldPassword123!',
                newPassword: 'OldPassword123!'
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('New password must be different from current password');
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

    it('should update profile successfully without overwriting other preferences', async () => {
        const user = await userModel.create({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            isActive: true,
            preferences: {
                theme: 'dark',
                notifications: {
                    email: true,
                    sms: true,
                    slack: false
                }
            }
        });

        const token = generateToken(user._id);

        const res = await request(app)
            .patch('/api/users/profile')
            .set('Cookie', [`accessToken=${token}`])
            .send({
                preferences: {
                    notifications: {
                        email: false
                    }
                }
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.user.preferences.theme).toEqual('dark'); // Should be preserved
        expect(res.body.user.preferences.notifications.email).toEqual(false); // Should be updated
        expect(res.body.user.preferences.notifications.sms).toEqual(true); // Should be preserved
        expect(res.body.user.preferences.notifications.slack).toEqual(false); // Should be preserved
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
