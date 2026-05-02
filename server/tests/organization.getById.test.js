import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import userModel from '../models/user.model.js';
import organizationModel from '../models/organization.model.js';
import config from '../config/config.js';

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
}, 300000);

afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
});

beforeEach(async () => {
    await userModel.deleteMany({});
    await organizationModel.deleteMany({});
});

describe('Get Organization By ID API', () => {
    const generateToken = (userId) => {
        return jwt.sign({ userId }, config.ACCESS_TOKEN_SECRET || 'test_secret', {
            expiresIn: '15m',
        });
    };

    it('should return 401 if not authenticated', async () => {
        const res = await request(app).get('/api/users/organization/someid');
        expect(res.statusCode).toEqual(401);
    });

    it('should return 400 for invalid organization ID format', async () => {
        const user = await userModel.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            isEmailVerified: true,
            isActive: true,
        });
        const token = generateToken(user._id);

        const res = await request(app)
            .get('/api/users/organization/invalid-id')
            .set('Cookie', [`accessToken=${token}`]);

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('Validation failed');
        expect(res.body.errors[0].field).toEqual('id');
    });

    it('should return 403 if user is not a member of the organization', async () => {
        const user = await userModel.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            isEmailVerified: true,
            isActive: true,
        });
        const token = generateToken(user._id);

        const otherUser = await userModel.create({
            name: 'Other User',
            email: 'other@example.com',
            password: 'password123',
        });

        const org = await organizationModel.create({
            name: 'Other Org',
            slug: 'other-org',
            owner: otherUser._id,
        });

        const res = await request(app)
            .get(`/api/users/organization/${org._id}`)
            .set('Cookie', [`accessToken=${token}`]);

        expect(res.statusCode).toEqual(403);
        expect(res.body.message).toEqual('Access denied');
    });

    it('should return 404 if organization does not exist but user has it in memberships (edge case)', async () => {
        const user = await userModel.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            isEmailVerified: true,
            isActive: true,
        });
        const token = generateToken(user._id);

        const fakeOrgId = new mongoose.Types.ObjectId();
        user.memberships.push({
            organization: fakeOrgId,
            role: 'admin',
        });
        await user.save();

        const res = await request(app)
            .get(`/api/users/organization/${fakeOrgId}`)
            .set('Cookie', [`accessToken=${token}`]);

        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual('Organization not found');
    });

    it('should return organization details and members for a valid member', async () => {
        const user = await userModel.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            isEmailVerified: true,
            isActive: true,
        });
        const token = generateToken(user._id);

        const org = await organizationModel.create({
            name: 'Test Org',
            slug: 'test-org',
            description: 'A test organization',
            owner: user._id,
        });

        user.memberships.push({
            organization: org._id,
            role: 'admin',
        });
        await user.save();

        const res = await request(app)
            .get(`/api/users/organization/${org._id}`)
            .set('Cookie', [`accessToken=${token}`]);

        expect(res.statusCode).toEqual(200);
        expect(res.body.organization.name).toEqual('Test Org');
        expect(res.body.organization.description).toEqual('A test organization');
        expect(res.body.members).toHaveLength(1);
        expect(res.body.members[0].name).toEqual('Test User');
        expect(res.body.members[0].role).toEqual('admin');
    });
});
