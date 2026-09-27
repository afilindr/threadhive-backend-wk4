import "dotenv/config";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";

import app from "../src/app.js";
import Thread from "../src/models/Thread.js";
import User from "../src/models/User.js";
import Subreddit from "../src/models/Subreddit.js";

process.env.JWT_SECRET ??= "thread-test-secret";

let mongoServer;
let user;
let subreddit;
let token;

const authHeader = () => ({ Authorization: `Bearer ${token}` });

const createThread = (overrides = {}) =>
  Thread.create({
    title: "A test thread",
    content: "Thread content",
    author: user._id,
    subreddit: subreddit._id,
    ...overrides,
  });

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Promise.all([
    Thread.deleteMany({}),
    User.deleteMany({}),
    Subreddit.deleteMany({}),
  ]);

  user = await User.create({
    name: "Test User",
    email: "test@example.com",
    password: "hashed-password",
  });
  subreddit = await Subreddit.create({
    name: "testing",
    description: "A subreddit for tests",
    author: user._id,
  });
  token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET);
});

describe("/api/threads", () => {
  describe("authentication", () => {
    it("rejects requests without a bearer token", async () => {
      const response = await request(app).get("/api/threads");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: "Authentication required.",
      });
    });
  });

  describe("GET /api/threads", () => {
    it("returns all threads with populated author and subreddit", async () => {
      await createThread({ title: "Newest thread" });
      await createThread({ title: "Older thread" });

      const response = await request(app)
        .get("/api/threads")
        .set(authHeader());

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Threads fetched successfully");
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].author.name).toBe("Test User");
      expect(response.body.data[0].subreddit.name).toBe("testing");
    });

    it("returns 404 when no threads exist", async () => {
      const response = await request(app)
        .get("/api/threads")
        .set(authHeader());

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: "No threads found",
      });
    });
  });

  describe("GET /api/threads/:id", () => {
    it("returns a thread by id", async () => {
      const thread = await createThread();

      const response = await request(app)
        .get(`/api/threads/${thread._id}`)
        .set(authHeader());

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe("A test thread");
      expect(response.body.data.author.name).toBe("Test User");
      expect(response.body.data.subreddit.name).toBe("testing");
    });

    it("returns 404 when the thread does not exist", async () => {
      const response = await request(app)
        .get(`/api/threads/${new mongoose.Types.ObjectId()}`)
        .set(authHeader());

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Thread not found");
    });
  });

  describe("POST /api/threads", () => {
    it("creates a thread for the authenticated user", async () => {
      const response = await request(app)
        .post("/api/threads")
        .set(authHeader())
        .send({
          title: "Created through the API",
          content: "A new thread",
          subreddit: subreddit._id.toString(),
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Thread created successfully");
      expect(response.body.data.title).toBe("Created through the API");
      expect(response.body.data.author.name).toBe("Test User");
      await expect(Thread.countDocuments()).resolves.toBe(1);
    });

    it("returns 400 when required fields are missing", async () => {
      const response = await request(app)
        .post("/api/threads")
        .set(authHeader())
        .send({ title: "Missing content" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Title, content, and subreddit are required.",
      );
      await expect(Thread.countDocuments()).resolves.toBe(0);
    });
  });

  describe("PUT /api/threads/:id", () => {
    it("updates an existing thread", async () => {
      const thread = await createThread();

      const response = await request(app)
        .put(`/api/threads/${thread._id}`)
        .set(authHeader())
        .send({ title: "Updated title" });

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe("Updated title");
      await expect(Thread.findById(thread._id).then((item) => item.title)).resolves.toBe(
        "Updated title",
      );
    });

    it("returns 404 when updating a missing thread", async () => {
      const response = await request(app)
        .put(`/api/threads/${new mongoose.Types.ObjectId()}`)
        .set(authHeader())
        .send({ title: "Updated title" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Thread not found or update failed");
    });
  });

  describe("DELETE /api/threads/:id", () => {
    it("deletes an existing thread", async () => {
      const thread = await createThread();

      const response = await request(app)
        .delete(`/api/threads/${thread._id}`)
        .set(authHeader());

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Thread deleted successfully");
      await expect(Thread.exists({ _id: thread._id })).resolves.toBeNull();
    });

    it("returns 404 when deleting a missing thread", async () => {
      const response = await request(app)
        .delete(`/api/threads/${new mongoose.Types.ObjectId()}`)
        .set(authHeader());

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Thread not found or deletion failed");
    });
  });
});