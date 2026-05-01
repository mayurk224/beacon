import { jest } from "@jest/globals";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import app from "../src/app.js";
import userModel from "../models/user.model.js";
import { OAuth2Client } from "google-auth-library";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await userModel.deleteMany({});
  jest.restoreAllMocks();
});

describe("Google Auth API", () => {
  it("should successfully login/signup with a valid Google token", async () => {
    const verifyIdTokenSpy = jest.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({
      getPayload: () => ({
        email: "test@gmail.com",
        name: "Test User",
        picture: "https://test.com/avatar.png",
        sub: "google123",
        email_verified: true,
      }),
    });

    const response = await request(app)
      .post("/api/auth/google")
      .send({ credential: "valid-mock-token" });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Google login successful");
    expect(response.body.user.email).toBe("test@gmail.com");

    const user = await userModel.findOne({ email: "test@gmail.com" });
    expect(user).toBeTruthy();
    expect(user.authProvider).toBe("google");
    expect(user.providerId).toBe("google123");
    
    verifyIdTokenSpy.mockRestore();
  });

  it("should fail if no credential is provided", async () => {
    const response = await request(app)
      .post("/api/auth/google")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("No credential provided");
  });

  it("should link local account to google if email matches", async () => {
    jest.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({
      getPayload: () => ({
        email: "test@gmail.com",
        name: "Test User",
        picture: "https://test.com/avatar.png",
        sub: "google123",
        email_verified: true,
      }),
    });

    // Create local user first
    await userModel.create({
      name: "Local User",
      email: "test@gmail.com",
      password: "password123",
      authProvider: "local",
    });

    const response = await request(app)
      .post("/api/auth/google")
      .send({ credential: "valid-mock-token" });

    expect(response.status).toBe(200);
    const user = await userModel.findOne({ email: "test@gmail.com" });
    expect(user.authProvider).toBe("google");
    expect(user.providerId).toBe("google123");
  });

  it("should fail if email is not verified on Google", async () => {
    jest.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValue({
      getPayload: () => ({
        email: "unverified@gmail.com",
        email_verified: false,
      }),
    });

    const response = await request(app)
      .post("/api/auth/google")
      .send({ credential: "unverified-token" });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Google email not verified");
  });
});
