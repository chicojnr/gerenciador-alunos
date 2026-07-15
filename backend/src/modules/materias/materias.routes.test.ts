import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../app.js";
import { prisma } from "../../core/prisma.js";
import { loadConfig } from "../../core/config.js";
import { signAccessToken } from "../../core/jwt.js";
import { hashPassword } from "../../core/password.js";

describe("materias routes", () => {
  let app: FastifyInstance;
  let authCookie: string;

  beforeAll(async () => {
    app = await buildApp();
    const config = loadConfig();
    const user = await prisma.user.upsert({
      where: { email: "routes-test@example.com" },
      update: {},
      create: {
        email: "routes-test@example.com",
        passwordHash: await hashPassword("x"),
        name: "Tester"
      }
    });
    authCookie = `access_token=${signAccessToken(user.id, user.role, config.jwtAccessSecret)}`;
  });

  beforeEach(async () => {
    await prisma.materia.deleteMany();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it("rejects unauthenticated requests", async () => {
    const response = await app.inject({ method: "GET", url: "/materias" });
    expect(response.statusCode).toBe(401);
  });

  it("creates then lists a materia", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/materias",
      headers: { cookie: authCookie },
      payload: { nome: "Matemática", codigo: "MAT1" }
    });
    expect(createRes.statusCode).toBe(201);

    const listRes = await app.inject({
      method: "GET",
      url: "/materias",
      headers: { cookie: authCookie }
    });
    expect(listRes.statusCode).toBe(200);
    const body = listRes.json();
    expect(body.items).toHaveLength(1);
    expect(body.items[0].nome).toBe("Matemática");
    expect(body.items[0].codigo).toBe("MAT1");
  });

  it("soft-deletes a materia", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/materias",
      headers: { cookie: authCookie },
      payload: { nome: "Para Remover", codigo: "REM1" }
    });
    const { id } = createRes.json();

    const deleteRes = await app.inject({
      method: "DELETE",
      url: `/materias/${id}`,
      headers: { cookie: authCookie }
    });
    expect(deleteRes.statusCode).toBe(200);

    const listRes = await app.inject({
      method: "GET",
      url: "/materias",
      headers: { cookie: authCookie }
    });
    expect(listRes.json().items).toHaveLength(0);
  });

  it("confirms import creating valid items and reporting errors for invalid ones", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/materias/import/confirm",
      headers: { cookie: authCookie },
      payload: {
        items: [
          { nome: "Arte", codigo: "ART1" },
          { nome: "Sem código", codigo: "" }
        ]
      }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.created).toHaveLength(1);
    expect(body.created[0].codigo).toBe("ART1");
    expect(body.errors).toHaveLength(1);
  });

  it("rejects import confirm with no items", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/materias/import/confirm",
      headers: { cookie: authCookie },
      payload: { items: [] }
    });
    expect(response.statusCode).toBe(400);
  });
});
