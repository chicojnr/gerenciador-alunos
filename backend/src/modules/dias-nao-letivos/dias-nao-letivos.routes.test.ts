import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../app.js";
import { prisma } from "../../core/prisma.js";
import { loadConfig } from "../../core/config.js";
import { signAccessToken } from "../../core/jwt.js";
import { hashPassword } from "../../core/password.js";

describe("dias-nao-letivos routes", () => {
  let app: FastifyInstance;
  let authCookie: string;
  let escolaId: string;

  beforeAll(async () => {
    app = await buildApp();
    const config = loadConfig();
    const user = await prisma.user.upsert({
      where: { email: "routes-test@example.com" },
      update: { role: "ADMIN" },
      create: {
        email: "routes-test@example.com",
        passwordHash: await hashPassword("x"),
        name: "Tester",
        role: "ADMIN"
      }
    });
    authCookie = `access_token=${signAccessToken(user.id, user.role, config.jwtAccessSecret)}`;
  });

  beforeEach(async () => {
    await prisma.diaNaoLetivo.deleteMany();
    await prisma.escola.deleteMany({ where: { nome: { contains: "dias-nao-letivos-test" } } });
    const escola = await prisma.escola.create({
      data: { nome: "Escola dias-nao-letivos-test" }
    });
    escolaId = escola.id;
  });

  afterAll(async () => {
    await prisma.diaNaoLetivo.deleteMany();
    await prisma.escola.deleteMany({ where: { nome: { contains: "dias-nao-letivos-test" } } });
    await app.close();
    await prisma.$disconnect();
  });

  it("rejects unauthenticated requests", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/escolas/${escolaId}/dias-nao-letivos`
    });
    expect(response.statusCode).toBe(401);
  });

  it("creates a dia não letivo and lists it", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: `/escolas/${escolaId}/dias-nao-letivos`,
      headers: { cookie: authCookie },
      payload: { data: "2026-09-07", tipo: "FERIADO", descricao: "Independência" }
    });
    expect(createRes.statusCode).toBe(201);

    const listRes = await app.inject({
      method: "GET",
      url: `/escolas/${escolaId}/dias-nao-letivos`,
      headers: { cookie: authCookie }
    });
    expect(listRes.json()).toHaveLength(1);
    expect(listRes.json()[0].tipo).toBe("FERIADO");
  });

  it("rejects an invalid tipo", async () => {
    const response = await app.inject({
      method: "POST",
      url: `/escolas/${escolaId}/dias-nao-letivos`,
      headers: { cookie: authCookie },
      payload: { data: "2026-09-07", tipo: "NATAL" }
    });
    expect(response.statusCode).toBe(400);
  });

  it("rejects an invalid date", async () => {
    const response = await app.inject({
      method: "POST",
      url: `/escolas/${escolaId}/dias-nao-letivos`,
      headers: { cookie: authCookie },
      payload: { data: "2026-02-31", tipo: "FERIADO" }
    });
    expect(response.statusCode).toBe(400);
  });

  it("rejects a duplicate date for the same escola", async () => {
    await app.inject({
      method: "POST",
      url: `/escolas/${escolaId}/dias-nao-letivos`,
      headers: { cookie: authCookie },
      payload: { data: "2026-09-07", tipo: "FERIADO" }
    });
    const response = await app.inject({
      method: "POST",
      url: `/escolas/${escolaId}/dias-nao-letivos`,
      headers: { cookie: authCookie },
      payload: { data: "2026-09-07", tipo: "PONTE" }
    });
    expect(response.statusCode).toBe(400);
  });

  it("removes a dia não letivo", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: `/escolas/${escolaId}/dias-nao-letivos`,
      headers: { cookie: authCookie },
      payload: { data: "2026-09-07", tipo: "FERIAS" }
    });
    const id = createRes.json().id;

    const removeRes = await app.inject({
      method: "DELETE",
      url: `/dias-nao-letivos/${id}`,
      headers: { cookie: authCookie }
    });
    expect(removeRes.statusCode).toBe(200);

    const listRes = await app.inject({
      method: "GET",
      url: `/escolas/${escolaId}/dias-nao-letivos`,
      headers: { cookie: authCookie }
    });
    expect(listRes.json()).toHaveLength(0);
  });

  it("404s removing a non-existent dia não letivo", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/dias-nao-letivos/00000000-0000-0000-0000-000000000000",
      headers: { cookie: authCookie }
    });
    expect(response.statusCode).toBe(404);
  });
});
