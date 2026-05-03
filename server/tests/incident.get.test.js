import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import userModel from '../models/user.model.js';
import organizationModel from '../models/organization.model.js';
import incidentModel from '../models/incident.model.js';
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
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await userModel.deleteMany({});
  await organizationModel.deleteMany({});
  await incidentModel.deleteMany({});
});

const createToken = (userId) => {
  return jwt.sign({ userId }, config.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

describe('Get All Incidents API', () => {
  const setupTestData = async () => {
    const userId = new mongoose.Types.ObjectId();
    const org1 = await organizationModel.create({
      name: 'Org 1',
      slug: 'org-1',
      owner: userId,
    });

    const org2 = await organizationModel.create({
      name: 'Org 2',
      slug: 'org-2',
      owner: userId,
    });

    const user = await userModel.create({
      _id: userId,
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      isEmailVerified: true,
      memberships: [
        { organization: org1._id, role: 'admin' },
        { organization: org2._id, role: 'responder' }
      ],
    });

    const token = createToken(user._id);

    // Create some incidents with manual createdAt to ensure different timestamps
    const now = new Date();
    const incidentsData = [
      { title: 'Incident 1', description: 'Desc 1', severity: 'low', organization: org1._id, createdBy: userId, status: 'open', createdAt: new Date(now.getTime() - 4000) },
      { title: 'Incident 2', description: 'Desc 2', severity: 'medium', organization: org1._id, createdBy: userId, status: 'investigating', createdAt: new Date(now.getTime() - 3000) },
      { title: 'Incident 3', description: 'Desc 3', severity: 'high', organization: org2._id, createdBy: userId, status: 'resolved', createdAt: new Date(now.getTime() - 2000) },
      { title: 'Incident 4', description: 'Desc 4', severity: 'critical', organization: org2._id, createdBy: userId, status: 'open', createdAt: new Date(now.getTime() - 1000) },
      { title: 'Incident 5', description: 'Desc 5', severity: 'low', organization: org1._id, createdBy: userId, status: 'open', createdAt: now },
    ];

    for (const data of incidentsData) {
      await incidentModel.create(data);
    }

    return { user, org1, org2, token };
  };

  it('should get all incidents for user organizations', async () => {
    const { token } = await setupTestData();

    const res = await request(app)
      .get('/api/incidents/all')
      .set('Cookie', [`accessToken=${token}`]);

    expect(res.statusCode).toEqual(200);
    expect(res.body.incidents.length).toEqual(5);
    expect(res.body.pagination.total).toEqual(5);
  });

  it('should filter incidents by organizationId', async () => {
    const { org1, token } = await setupTestData();

    const res = await request(app)
      .get(`/api/incidents/all?organizationId=${org1._id}`)
      .set('Cookie', [`accessToken=${token}`]);

    expect(res.statusCode).toEqual(200);
    expect(res.body.incidents.length).toEqual(3);
    expect(res.body.incidents.every(i => i.organization._id === org1._id.toString() || i.organization === org1._id.toString())).toBe(true);
  });

  it('should return 403 if user tries to access organization they do not belong to', async () => {
    const { token } = await setupTestData();
    const otherOrgId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .get(`/api/incidents/all?organizationId=${otherOrgId}`)
      .set('Cookie', [`accessToken=${token}`]);

    expect(res.statusCode).toEqual(403);
    expect(res.body.message).toEqual('You do not have access to this organization');
  });

  it('should filter incidents by status', async () => {
    const { token } = await setupTestData();

    const res = await request(app)
      .get('/api/incidents/all?status=investigating')
      .set('Cookie', [`accessToken=${token}`]);

    expect(res.statusCode).toEqual(200);
    expect(res.body.incidents.length).toEqual(1);
    expect(res.body.incidents[0].status).toEqual('investigating');
  });

  it('should filter incidents by severity', async () => {
    const { token } = await setupTestData();

    const res = await request(app)
      .get('/api/incidents/all?severity=low')
      .set('Cookie', [`accessToken=${token}`]);

    expect(res.statusCode).toEqual(200);
    expect(res.body.incidents.length).toEqual(2);
    expect(res.body.incidents.every(i => i.severity === 'low')).toBe(true);
  });

  it('should handle pagination (limit)', async () => {
    const { token } = await setupTestData();

    const res = await request(app)
      .get('/api/incidents/all?limit=2')
      .set('Cookie', [`accessToken=${token}`]);

    expect(res.statusCode).toEqual(200);
    expect(res.body.incidents.length).toEqual(2);
    expect(res.body.pagination.total).toEqual(5);
    expect(res.body.pagination.pages).toEqual(3);
  });

  it('should handle pagination (page)', async () => {
    const { token } = await setupTestData();

    const res = await request(app)
      .get('/api/incidents/all?limit=2&page=3')
      .set('Cookie', [`accessToken=${token}`]);

    expect(res.statusCode).toEqual(200);
    expect(res.body.incidents.length).toEqual(1);
  });

  it('should sort incidents by createdAt desc by default', async () => {
    const { token } = await setupTestData();

    const res = await request(app)
      .get('/api/incidents/all')
      .set('Cookie', [`accessToken=${token}`]);

    expect(res.statusCode).toEqual(200);
    // Incident 5 was created last, so it should be first in desc order
    expect(res.body.incidents[0].title).toEqual('Incident 5');
  });

  it('should sort incidents by createdAt asc', async () => {
    const { token } = await setupTestData();

    const res = await request(app)
      .get('/api/incidents/all?sortBy=createdAt&sortOrder=asc')
      .set('Cookie', [`accessToken=${token}`]);

    expect(res.statusCode).toEqual(200);
    // Incident 1 was created first
    expect(res.body.incidents[0].title).toEqual('Incident 1');
  });

  it('should sort incidents by title asc', async () => {
    const { token } = await setupTestData();

    const res = await request(app)
      .get('/api/incidents/all?sortBy=title&sortOrder=asc')
      .set('Cookie', [`accessToken=${token}`]);

    expect(res.statusCode).toEqual(200);
    expect(res.body.incidents[0].title).toEqual('Incident 1');
    expect(res.body.incidents[4].title).toEqual('Incident 5');
  });

  it('should return 400 for invalid query parameters', async () => {
    const { token } = await setupTestData();

    const res = await request(app)
      .get('/api/incidents/all?page=invalid&limit=200&status=invalid')
      .set('Cookie', [`accessToken=${token}`]);

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('Validation failed');
    expect(res.body.errors.some(e => e.field === 'page')).toBe(true);
    expect(res.body.errors.some(e => e.field === 'limit')).toBe(true);
    expect(res.body.errors.some(e => e.field === 'status')).toBe(true);
  });

  describe('Get Incident By ID', () => {
    it('should get an incident by ID successfully', async () => {
      const { token, org1 } = await setupTestData();
      const incident = await incidentModel.findOne({ organization: org1._id });

      const res = await request(app)
        .get(`/api/incidents/${incident._id}`)
        .set('Cookie', [`accessToken=${token}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body.incident._id).toEqual(incident._id.toString());
      expect(res.body.incident.title).toEqual(incident.title);
      expect(res.body.incident.createdBy).toBeDefined();
    });

    it('should return 400 for invalid incident ID format', async () => {
      const { token } = await setupTestData();

      const res = await request(app)
        .get('/api/incidents/invalid-id')
        .set('Cookie', [`accessToken=${token}`]);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Validation failed');
      expect(res.body.errors[0].field).toEqual('id');
    });

    it('should return 404 for non-existent incident ID', async () => {
      const { token } = await setupTestData();
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/incidents/${nonExistentId}`)
        .set('Cookie', [`accessToken=${token}`]);

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('Incident not found');
    });

    it('should return 403 if user does not belong to the incident organization', async () => {
      const { org1 } = await setupTestData();
      const incident = await incidentModel.findOne({ organization: org1._id });

      // Create a user who is not in org1
      const otherUserId = new mongoose.Types.ObjectId();
      await userModel.create({
        _id: otherUserId,
        name: 'Other User',
        email: 'other@example.com',
        password: 'Password123!',
        isEmailVerified: true,
        memberships: [],
      });
      const otherToken = createToken(otherUserId);

      const res = await request(app)
        .get(`/api/incidents/${incident._id}`)
        .set('Cookie', [`accessToken=${otherToken}`]);

      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toEqual('Access denied');
    });
  });
});
