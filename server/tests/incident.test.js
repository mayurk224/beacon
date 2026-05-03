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
  await mongoServer.stop();
});

beforeEach(async () => {
  await userModel.deleteMany({});
  await organizationModel.deleteMany({});
  await incidentModel.deleteMany({});
});

const createToken = (userId) => {
  return jwt.sign({ userId }, config.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

describe('Incident Creation API', () => {
  const setupTestData = async () => {
    const userId = new mongoose.Types.ObjectId();
    const org = await organizationModel.create({
      name: 'Test Org',
      slug: 'test-org',
      owner: userId,
    });

    const user = await userModel.create({
      _id: userId,
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      isEmailVerified: true,
      memberships: [{ organization: org._id, role: 'admin' }],
    });

    const otherUser = await userModel.create({
      name: 'Other User',
      email: 'other@example.com',
      password: 'Password123!',
      isEmailVerified: true,
      memberships: [], // Not in org
    });

    const token = createToken(user._id);
    return { user, org, token, otherUser };
  };

  it('should create an incident successfully', async () => {
    const { org, token } = await setupTestData();

    const incidentData = {
      title: 'Server Down',
      description: 'The production server is unresponsive',
      severity: 'critical',
      organizationId: org._id.toString(),
    };

    const res = await request(app)
      .post('/api/incidents/create')
      .set('Cookie', [`accessToken=${token}`])
      .send(incidentData);

    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toEqual('Incident created successfully');
    expect(res.body.incident.title).toEqual(incidentData.title);
    expect(res.body.incident.organization).toEqual(org._id.toString());
  });

  it('should fail if title is missing', async () => {
    const { org, token } = await setupTestData();

    const incidentData = {
      description: 'The production server is unresponsive',
      severity: 'critical',
      organizationId: org._id.toString(),
    };

    const res = await request(app)
      .post('/api/incidents/create')
      .set('Cookie', [`accessToken=${token}`])
      .send(incidentData);

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('Validation failed');
    expect(res.body.errors.some(e => e.field === 'title')).toBeTruthy();
  });

  it('should fail if user is not part of the organization', async () => {
    const { token } = await setupTestData();
    const anotherOrg = await organizationModel.create({
      name: 'Another Org',
      slug: 'another-org',
      owner: new mongoose.Types.ObjectId(),
    });

    const incidentData = {
      title: 'Server Down',
      description: 'The production server is unresponsive',
      severity: 'critical',
      organizationId: anotherOrg._id.toString(),
    };

    const res = await request(app)
      .post('/api/incidents/create')
      .set('Cookie', [`accessToken=${token}`])
      .send(incidentData);

    expect(res.statusCode).toEqual(403);
    expect(res.body.message).toEqual('You are not part of this organization');
  });

  it('should fail if assigned users are not in the organization', async () => {
    const { org, token, otherUser } = await setupTestData();

    const incidentData = {
      title: 'Server Down',
      description: 'The production server is unresponsive',
      severity: 'critical',
      organizationId: org._id.toString(),
      assignedUsers: [otherUser._id.toString()],
    };

    const res = await request(app)
      .post('/api/incidents/create')
      .set('Cookie', [`accessToken=${token}`])
      .send(incidentData);

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('One or more assigned users are invalid or not in the organization');
  });

  it('should fail if organizationId is invalid', async () => {
    const { token } = await setupTestData();

    const incidentData = {
      title: 'Server Down',
      description: 'The production server is unresponsive',
      severity: 'critical',
      organizationId: 'invalid-id',
    };

    const res = await request(app)
      .post('/api/incidents/create')
      .set('Cookie', [`accessToken=${token}`])
      .send(incidentData);

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('Validation failed');
    expect(res.body.errors.some(e => e.field === 'organizationId')).toBeTruthy();
  });

  it('should fail if unauthorized (no token)', async () => {
    const { org } = await setupTestData();

    const incidentData = {
      title: 'Server Down',
      description: 'The production server is unresponsive',
      severity: 'critical',
      organizationId: org._id.toString(),
    };

    const res = await request(app)
      .post('/api/incidents/create')
      .send(incidentData);

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Unauthorized');
  });
});
