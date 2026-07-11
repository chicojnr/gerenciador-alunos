import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../app.js";
import { prisma } from "../../core/prisma.js";
import { loadConfig } from "../../core/config.js";
import { signAccessToken } from "../../core/jwt.js";
import { hashPassword } from "../../core/password.js";

describe("escolas routes", () => {
  let app: FastifyInstance;
  let authCookie: string;
  let nonAdminCookie: string;

  beforeAll(async () => {
    app = await buildApp();
    const config = loadConfig();
    const admin = await prisma.user.upsert({
      where: { email: "routes-test@example.com" },
      update: { role: "ADMIN" },
      create: {
        email: "routes-test@example.com",
        passwordHash: await hashPassword("x"),
        name: "Tester",
        role: "ADMIN"
      }
    });
    authCookie = `access_token=${signAccessToken(admin.id, admin.role, config.jwtAccessSecret)}`;

    const nonAdmin = await prisma.user.upsert({
      where: { email: "routes-test-user@example.com" },
      update: { role: "USER" },
      create: {
        email: "routes-test-user@example.com",
        passwordHash: await hashPassword("x"),
        name: "Non-Admin Tester",
        role: "USER"
      }
    });
    nonAdminCookie = `access_token=${signAccessToken(nonAdmin.id, nonAdmin.role, config.jwtAccessSecret)}`;
  });

  beforeEach(async () => {
    await prisma.escola.deleteMany();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it("rejects unauthenticated requests", async () => {
    const response = await app.inject({ method: "GET", url: "/escolas" });
    expect(response.statusCode).toBe(401);
  });

  it("rejects non-admin requests", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/escolas",
      headers: { cookie: nonAdminCookie }
    });
    expect(response.statusCode).toBe(403);
  });

  it("allows a non-admin to read /escolas/options (id+nome only, for Turma/Professor selects)", async () => {
    await app.inject({
      method: "POST",
      url: "/escolas",
      headers: { cookie: authCookie },
      payload: { nome: "Escola Options Teste" }
    });

    const response = await app.inject({
      method: "GET",
      url: "/escolas/options",
      headers: { cookie: nonAdminCookie }
    });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toEqual([expect.objectContaining({ nome: "Escola Options Teste" })]);
    expect(body[0].cnpj).toBeUndefined();
  });

  it("rejects unauthenticated requests to /escolas/options", async () => {
    const response = await app.inject({ method: "GET", url: "/escolas/options" });
    expect(response.statusCode).toBe(401);
  });

  it("creates then lists an escola", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/escolas",
      headers: { cookie: authCookie },
      payload: { nome: "Escola Teste" }
    });
    expect(createRes.statusCode).toBe(201);

    const listRes = await app.inject({
      method: "GET",
      url: "/escolas",
      headers: { cookie: authCookie }
    });
    expect(listRes.statusCode).toBe(200);
    const body = listRes.json();
    expect(body.items).toHaveLength(1);
    expect(body.items[0].nome).toBe("Escola Teste");
  });

  it("soft-deletes an escola", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/escolas",
      headers: { cookie: authCookie },
      payload: { nome: "Para Remover" }
    });
    const { id } = createRes.json();

    const deleteRes = await app.inject({
      method: "DELETE",
      url: `/escolas/${id}`,
      headers: { cookie: authCookie }
    });
    expect(deleteRes.statusCode).toBe(200);

    const listRes = await app.inject({
      method: "GET",
      url: "/escolas",
      headers: { cookie: authCookie }
    });
    expect(listRes.json().items).toHaveLength(0);
  });
});
