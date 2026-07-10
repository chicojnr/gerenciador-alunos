import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { buildApp } from "../app.js";
import { prisma } from "../core/prisma.js";
import { hashPassword } from "../core/password.js";
import type { FastifyInstance } from "fastify";

describe("auth routes", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany({
      where: {
        email: { in: ["admin@example.com", "routes-test@example.com", "no-such-user@example.com"] }
      }
    });
    await prisma.user.create({
      data: {
        email: "admin@example.com",
        passwordHash: await hashPassword("correct-password"),
        name: "Admin"
      }
    });
  });

  it("logs in with correct credentials and sets cookies", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "admin@example.com", password: "correct-password" }
    });

    expect(response.statusCode).toBe(200);
    const cookies = response.cookies.map((c) => c.name);
    expect(cookies).toContain("access_token");
    expect(cookies).toContain("refresh_token");
  });

  it("rejects wrong password", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "admin@example.com", password: "wrong" }
    });

    expect(response.statusCode).toBe(401);
  });

  it("rejects non-existent email", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "no-such-user@example.com", password: "wrong" }
    });

    expect(response.statusCode).toBe(401);
  });
});
