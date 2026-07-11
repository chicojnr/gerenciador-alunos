import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../app.js";
import { prisma } from "../../core/prisma.js";
import { loadConfig } from "../../core/config.js";
import { signAccessToken } from "../../core/jwt.js";
import { hashPassword } from "../../core/password.js";

describe("calendarios-letivos routes", () => {
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
    await prisma.calendarioLetivo.deleteMany();
    await prisma.escola.deleteMany({ where: { nome: { contains: "calendarios-test" } } });
    const escola = await prisma.escola.create({ data: { nome: "Escola calendarios-test" } });
    escolaId = escola.id;
  });

  afterAll(async () => {
    await prisma.calendarioLetivo.deleteMany();
    await prisma.escola.deleteMany({ where: { nome: { contains: "calendarios-test" } } });
    await app.close();
    await prisma.$disconnect();
  });

  it("rejects unauthenticated requests", async () => {
    const response = await app.inject({ method: "GET", url: "/calendarios-letivos" });
    expect(response.statusCode).toBe(401);
  });

  it("creates then lists a calendario letivo", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/calendarios-letivos",
      headers: { cookie: authCookie },
      payload: {
        nome: "Ano Letivo 2026",
        dataInicio: "2026-02-01",
        dataFim: "2026-12-15",
        escolaId
      }
    });
    expect(createRes.statusCode).toBe(201);
    expect(createRes.json().escola.id).toBe(escolaId);

    const listRes = await app.inject({
      method: "GET",
      url: "/calendarios-letivos",
      headers: { cookie: authCookie }
    });
    expect(listRes.json().items).toHaveLength(1);
  });

  it("rejects when dataInicio is after dataFim", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/calendarios-letivos",
      headers: { cookie: authCookie },
      payload: {
        nome: "Invalido",
        dataInicio: "2026-12-15",
        dataFim: "2026-02-01",
        escolaId
      }
    });
    expect(response.statusCode).toBe(400);
  });

  it("soft-deletes a calendario letivo", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/calendarios-letivos",
      headers: { cookie: authCookie },
      payload: {
        nome: "Para Remover",
        dataInicio: "2026-02-01",
        dataFim: "2026-12-15",
        escolaId
      }
    });
    const { id } = createRes.json();

    const deleteRes = await app.inject({
      method: "DELETE",
      url: `/calendarios-letivos/${id}`,
      headers: { cookie: authCookie }
    });
    expect(deleteRes.statusCode).toBe(200);
  });
});
