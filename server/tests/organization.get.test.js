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

describe('Get My Organizations API', () => {
    const generateToken = (userId) => {
        return jwt.sign({ userId }, config.ACCESS_TOKEN_SECRET || 'test_secret', {
            expiresIn: '15m',
        });
    };

    it('should return 401 if not authenticated', async () => {
        const res = await request(app).get('/api/users/organization/my');
        expect(res.statusCode).toEqual(401);
    });

    it('should return empty array if user has no organizations', async () => {
        const user = await userModel.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            isEmailVerified: true,
            isActive: true,
        });
        const token = generateToken(user._id);

        const res = await request(app)
            .get('/api/users/organization/my')
            .set('Cookie', [`accessToken=${token}`]);

        expect(res.statusCode).toEqual(200);
        expect(res.body.organizations).toEqual([]);
    });

    it('should return user organizations with correct structure', async () => {
        const user = await userModel.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            isEmailVerified: true,
            isActive: true,
        });

        const org = await organizationModel.create({
            name: 'Test Org',
            slug: 'test-org',
            description: 'A test organization',
            owner: user._id,
            membersCount: 1
        });

        user.memberships.push({
            organization: org._id,
            role: 'admin',
        });
        await user.save();

        const token = generateToken(user._id);

        const res = await request(app)
            .get('/api/users/organization/my')
            .set('Cookie', [`accessToken=${token}`]);

        expect(res.statusCode).toEqual(200);
        expect(res.body.organizations).toHaveLength(1);
        const returnedOrg = res.body.organizations[0];
        expect(returnedOrg.name).toEqual('Test Org');
        expect(returnedOrg.slug).toEqual('test-org');
        expect(returnedOrg.description).toEqual('A test organization');
        expect(returnedOrg.role).toEqual('admin');
        expect(returnedOrg.isOwner).toBe(true);
        expect(returnedOrg.isActive).toBe(true);
        expect(returnedOrg.organizationId).toEqual(org._id.toString());
    });

    it('should filter out deleted organizations', async () => {
        const user = await userModel.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            isEmailVerified: true,
            isActive: true,
        });

        const org = await organizationModel.create({
            name: 'Test Org',
            slug: 'test-org',
            owner: user._id,
        });

        user.memberships.push({
            organization: org._id,
            role: 'admin',
        });
        await user.save();

        // Delete the organization from the database but NOT from user memberships
        await organizationModel.findByIdAndDelete(org._id);

        const token = generateToken(user._id);

        const res = await request(app)
            .get('/api/users/organization/my')
            .set('Cookie', [`accessToken=${token}`]);

        expect(res.statusCode).toEqual(200);
        expect(res.body.organizations).toEqual([]);
    });
});
