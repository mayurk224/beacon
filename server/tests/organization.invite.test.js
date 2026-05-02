import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import userModel from '../models/user.model.js';
import organizationModel from '../models/organization.model.js';
import inviteModel from '../models/invite.model.js';
import config from '../config/config.js';

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({
        replSet: { count: 1 }
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
    await organizationModel.deleteMany({});
    await inviteModel.deleteMany({});
});

describe('Organization Invitation API', () => {
    const generateToken = (userId) => {
        return jwt.sign({ userId }, config.ACCESS_TOKEN_SECRET || 'test_secret', {
            expiresIn: '15m',
        });
    };

    const setupData = async () => {
        const admin = await userModel.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            isEmailVerified: true,
            isActive: true,
        });

        const org = await organizationModel.create({
            name: 'Test Org',
            slug: 'test-org',
            owner: admin._id,
            membersCount: 1
        });

        // Add admin membership
        admin.memberships.push({
            organization: org._id,
            role: 'admin',
        });
        await admin.save();

        const token = generateToken(admin._id);
        return { admin, org, token };
    };

    describe('POST /api/users/organization/user/invite', () => {
        it('should send an invite successfully', async () => {
            const { org, token } = await setupData();
            const inviteEmail = 'invitee@example.com';

            const res = await request(app)
                .post('/api/users/organization/user/invite')
                .set('Cookie', [`accessToken=${token}`])
                .send({
                    email: inviteEmail,
                    role: 'responder',
                    organizationId: org._id.toString()
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('Invite sent successfully');

            const invite = await inviteModel.findOne({ email: inviteEmail });
            expect(invite).toBeDefined();
            expect(invite.organization.toString()).toEqual(org._id.toString());
        });

        it('should fail if requester is not an admin', async () => {
            const { org } = await setupData();
            
            const regularUser = await userModel.create({
                name: 'Regular User',
                email: 'regular@example.com',
                password: 'password123',
                isEmailVerified: true,
                isActive: true,
            });
            const userToken = generateToken(regularUser._id);

            const res = await request(app)
                .post('/api/users/organization/user/invite')
                .set('Cookie', [`accessToken=${userToken}`])
                .send({
                    email: 'invitee@example.com',
                    role: 'responder',
                    organizationId: org._id.toString()
                });

            expect(res.statusCode).toEqual(403);
            expect(res.body.message).toEqual('Only organization admins can send invites');
        });

        it('should fail if user is already a member', async () => {
            const { admin, org, token } = await setupData();

            const res = await request(app)
                .post('/api/users/organization/user/invite')
                .set('Cookie', [`accessToken=${token}`])
                .send({
                    email: admin.email,
                    role: 'responder',
                    organizationId: org._id.toString()
                });

            expect(res.statusCode).toEqual(409);
            expect(res.body.message).toEqual('User is already a member of this organization');
        });

        it('should fail if a pending invite already exists', async () => {
            const { org, token } = await setupData();
            const inviteEmail = 'pending@example.com';

            // Create existing invite
            await inviteModel.create({
                email: inviteEmail,
                organization: org._id,
                token: '1234567890123456789012345678901234567890123456789012345678901234',
                expiresAt: Date.now() + 100000,
                status: 'pending'
            });

            const res = await request(app)
                .post('/api/users/organization/user/invite')
                .set('Cookie', [`accessToken=${token}`])
                .send({
                    email: inviteEmail,
                    role: 'responder',
                    organizationId: org._id.toString()
                });

            expect(res.statusCode).toEqual(409);
            expect(res.body.message).toEqual('A pending invitation already exists for this email');
        });
    });

    describe('POST /api/users/organization/user/invite/accept', () => {
        it('should accept invite successfully', async () => {
            const { org } = await setupData();
            const inviteeEmail = 'invitee@example.com';
            const invitee = await userModel.create({
                name: 'Invitee',
                email: inviteeEmail,
                password: 'password123',
                isEmailVerified: true,
                isActive: true,
            });
            const inviteeToken = generateToken(invitee._id);

            const inviteToken = '1234567890123456789012345678901234567890123456789012345678901234'; // 64 chars
            await inviteModel.create({
                email: inviteeEmail,
                organization: org._id,
                role: 'responder',
                token: inviteToken,
                expiresAt: Date.now() + 100000,
                status: 'pending'
            });

            const res = await request(app)
                .post('/api/users/organization/user/invite/accept')
                .set('Cookie', [`accessToken=${inviteeToken}`])
                .send({ token: inviteToken });

            expect(res.statusCode).toEqual(200);
            expect(res.body.message).toEqual('Joined organization successfully');

            const updatedUser = await userModel.findById(invitee._id);
            expect(updatedUser.memberships).toHaveLength(1);
            expect(updatedUser.memberships[0].organization.toString()).toEqual(org._id.toString());

            const updatedOrg = await organizationModel.findById(org._id);
            expect(updatedOrg.membersCount).toEqual(2);

            const updatedInvite = await inviteModel.findOne({ token: inviteToken });
            expect(updatedInvite.status).toEqual('accepted');
        });

        it('should fail if email does not match', async () => {
            const { org } = await setupData();
            const wrongUser = await userModel.create({
                name: 'Wrong User',
                email: 'wrong@example.com',
                password: 'password123',
                isEmailVerified: true,
                isActive: true,
            });
            const wrongUserToken = generateToken(wrongUser._id);

            const inviteToken = '1234567890123456789012345678901234567890123456789012345678901234';
            await inviteModel.create({
                email: 'invitee@example.com',
                organization: org._id,
                token: inviteToken,
                expiresAt: Date.now() + 100000,
                status: 'pending'
            });

            const res = await request(app)
                .post('/api/users/organization/user/invite/accept')
                .set('Cookie', [`accessToken=${wrongUserToken}`])
                .send({ token: inviteToken });

            expect(res.statusCode).toEqual(403);
            expect(res.body.message).toEqual('This invite is not for your email');
        });

        it('should fail if invite is expired', async () => {
            const { org } = await setupData();
            const invitee = await userModel.create({
                name: 'Invitee',
                email: 'invitee@example.com',
                password: 'password123',
                isEmailVerified: true,
                isActive: true,
            });
            const inviteeToken = generateToken(invitee._id);

            const inviteToken = '1234567890123456789012345678901234567890123456789012345678901234';
            await inviteModel.create({
                email: 'invitee@example.com',
                organization: org._id,
                token: inviteToken,
                expiresAt: Date.now() - 1000, // Expired
                status: 'pending'
            });

            const res = await request(app)
                .post('/api/users/organization/user/invite/accept')
                .set('Cookie', [`accessToken=${inviteeToken}`])
                .send({ token: inviteToken });

            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual('Invalid or expired invite');
        });
    });
});
