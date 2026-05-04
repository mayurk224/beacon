import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import userModel from '../models/user.model.js';
import organizationModel from '../models/organization.model.js';
import incidentModel from '../models/incident.model.js';
import incidentUpdateModel from '../models/incidentUpdate.model.js';
import config from '../config/config.js';

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
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await userModel.deleteMany({});
  await organizationModel.deleteMany({});
  await incidentModel.deleteMany({});
  await incidentUpdateModel.deleteMany({});
});

const createToken = (userId) => {
  return jwt.sign({ userId }, config.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

describe('Incident Assignment API', () => {
  const setupTestData = async (role = 'responder') => {
    const userId = new mongoose.Types.ObjectId();
    const org = await organizationModel.create({
      name: 'Test Org',
      slug: 'test-org-' + Date.now(),
      owner: userId,
    });

    const user = await userModel.create({
      _id: userId,
      name: 'Requester User',
      email: 'requester@example.com',
      password: 'Password123!',
      isEmailVerified: true,
      memberships: [{ organization: org._id, role }],
    });

    const responder1 = await userModel.create({
      name: 'Responder One',
      email: 'res1@example.com',
      password: 'Password123!',
      isEmailVerified: true,
      memberships: [{ organization: org._id, role: 'responder' }],
    });

    const responder2 = await userModel.create({
      name: 'Responder Two',
      email: 'res2@example.com',
      password: 'Password123!',
      isEmailVerified: true,
      memberships: [{ organization: org._id, role: 'responder' }],
    });

    const externalUser = await userModel.create({
      name: 'External User',
      email: 'external@example.com',
      password: 'Password123!',
      isEmailVerified: true,
      memberships: [],
    });

    const incident = await incidentModel.create({
      title: 'Test Incident',
      description: 'Test Description',
      severity: 'medium',
      organization: org._id,
      createdBy: user._id,
      assignedUsers: [],
    });

    const token = createToken(user._id);
    return { user, org, incident, responder1, responder2, externalUser, token };
  };

  describe('POST /api/incidents/:id/assign', () => {
    it('should assign users successfully', async () => {
      const { incident, responder1, responder2, token } = await setupTestData('admin');

      const res = await request(app)
        .post(`/api/incidents/${incident._id}/assign`)
        .set('Cookie', [`accessToken=${token}`])
        .send({ userIds: [responder1._id.toString(), responder2._id.toString()] });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Users assigned successfully');
      expect(res.body.assignedUsers).toHaveLength(2);
      expect(res.body.assignedUsers).toContain(responder1._id.toString());
      expect(res.body.assignedUsers).toContain(responder2._id.toString());

      // Check audit log
      const updates = await incidentUpdateModel.find({ incident: incident._id });
      expect(updates).toHaveLength(1);
      expect(updates[0].message).toContain('Assigned users');
      expect(updates[0].message).toContain('Responder One');
      expect(updates[0].message).toContain('Responder Two');
    });

    it('should fail if requester is a viewer', async () => {
      const { incident, responder1, token } = await setupTestData('viewer');

      const res = await request(app)
        .post(`/api/incidents/${incident._id}/assign`)
        .set('Cookie', [`accessToken=${token}`])
        .send({ userIds: [responder1._id.toString()] });

      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toEqual('Viewers cannot assign users');
    });

    it('should fail if assigning users from different org', async () => {
      const { incident, externalUser, token } = await setupTestData('admin');

      const res = await request(app)
        .post(`/api/incidents/${incident._id}/assign`)
        .set('Cookie', [`accessToken=${token}`])
        .send({ userIds: [externalUser._id.toString()] });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('No valid users found to assign');
    });

    it('should fail if incident is resolved', async () => {
      const { incident, responder1, token } = await setupTestData('admin');
      incident.status = 'resolved';
      await incident.save();

      const res = await request(app)
        .post(`/api/incidents/${incident._id}/assign`)
        .set('Cookie', [`accessToken=${token}`])
        .send({ userIds: [responder1._id.toString()] });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Cannot change assignments on a resolved incident');
    });

    it('should not add duplicates', async () => {
      const { incident, responder1, token } = await setupTestData('admin');
      incident.assignedUsers = [responder1._id];
      await incident.save();

      const res = await request(app)
        .post(`/api/incidents/${incident._id}/assign`)
        .set('Cookie', [`accessToken=${token}`])
        .send({ userIds: [responder1._id.toString()] });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('All specified users are already assigned');
    });
  });

  describe('POST /api/incidents/:id/unassign', () => {
    it('should unassign users successfully', async () => {
      const { incident, responder1, responder2, token } = await setupTestData('admin');
      incident.assignedUsers = [responder1._id, responder2._id];
      await incident.save();

      const res = await request(app)
        .post(`/api/incidents/${incident._id}/unassign`)
        .set('Cookie', [`accessToken=${token}`])
        .send({ userIds: [responder1._id.toString()] });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Users unassigned successfully');
      expect(res.body.assignedUsers).toHaveLength(1);
      expect(res.body.assignedUsers).toContain(responder2._id.toString());
      expect(res.body.assignedUsers).not.toContain(responder1._id.toString());

      // Check audit log
      const updates = await incidentUpdateModel.find({ incident: incident._id });
      expect(updates).toHaveLength(1);
      expect(updates[0].message).toContain('Unassigned users: Responder One');
    });

    it('should fail if trying to unassign users not assigned', async () => {
      const { incident, responder1, token } = await setupTestData('admin');

      const res = await request(app)
        .post(`/api/incidents/${incident._id}/unassign`)
        .set('Cookie', [`accessToken=${token}`])
        .send({ userIds: [responder1._id.toString()] });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('None of the specified users are currently assigned');
    });
  });

  describe('GET /api/incidents/:id/responders', () => {
    it('should get responders successfully', async () => {
      const { incident, responder1, responder2, token } = await setupTestData('responder');
      incident.assignedUsers = [responder1._id, responder2._id];
      await incident.save();

      const res = await request(app)
        .get(`/api/incidents/${incident._id}/responders`)
        .set('Cookie', [`accessToken=${token}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body.responders).toHaveLength(2);
      expect(res.body.responders[0]).toHaveProperty('name');
      expect(res.body.responders[0]).toHaveProperty('role');
      expect(res.body.responders.map(r => r.userId)).toContain(responder1._id.toString());
      expect(res.body.responders.map(r => r.userId)).toContain(responder2._id.toString());
    });

    it('should fail if user is not in the organization', async () => {
      const { incident } = await setupTestData('responder');
      
      const otherUser = await userModel.create({
        name: 'Other User',
        email: 'other@example.com',
        password: 'Password123!',
        isEmailVerified: true,
        memberships: [],
      });
      const otherToken = createToken(otherUser._id);

      const res = await request(app)
        .get(`/api/incidents/${incident._id}/responders`)
        .set('Cookie', [`accessToken=${otherToken}`]);

      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toEqual('Access denied');
    });

    it('should fail with invalid incident ID', async () => {
      const { token } = await setupTestData('responder');

      const res = await request(app)
        .get('/api/incidents/invalid-id/responders')
        .set('Cookie', [`accessToken=${token}`]);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Validation failed');
    });
  });
});
