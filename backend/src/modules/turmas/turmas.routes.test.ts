import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../app.js";
import { prisma } from "../../core/prisma.js";
import { loadConfig } from "../../core/config.js";
import { signAccessToken } from "../../core/jwt.js";
import { hashPassword } from "../../core/password.js";

describe("turmas routes", () => {
  let app: FastifyInstance;
  let authCookie: string;
  let escolaId: string;
  let periodoId: string;

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
    await prisma.turma.deleteMany();
    await prisma.escola.deleteMany({ where: { nome: { contains: "turmas-routes-test" } } });
    await prisma.periodo.deleteMany({ where: { nome: { contains: "turmas-routes-test" } } });
    const escola = await prisma.escola.create({ data: { nome: "Escola turmas-routes-test" } });
    const periodo = await prisma.periodo.create({ data: { nome: "Periodo turmas-routes-test" } });
    escolaId = escola.id;
    periodoId = periodo.id;
  });

  afterAll(async () => {
    await prisma.turma.deleteMany();
    await prisma.escola.deleteMany({ where: { nome: { contains: "turmas-routes-test" } } });
    await prisma.periodo.deleteMany({ where: { nome: { contains: "turmas-routes-test" } } });
    await app.close();
    await prisma.$disconnect();
  });

  it("rejects unauthenticated requests", async () => {
    const response = await app.inject({ method: "GET", url: "/turmas" });
    expect(response.statusCode).toBe(401);
  });

  it("creates then lists a turma, with nested escola and periodo", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/turmas",
      headers: { cookie: authCookie },
      payload: { nome: "Turma Teste", serie: "6º Ano", escolaId, periodoId }
    });
    expect(createRes.statusCode).toBe(201);
    expect(createRes.json().escola.id).toBe(escolaId);
    expect(createRes.json().periodo.id).toBe(periodoId);

    const listRes = await app.inject({
      method: "GET",
      url: "/turmas",
      headers: { cookie: authCookie }
    });
    expect(listRes.statusCode).toBe(200);
    expect(listRes.json().items).toHaveLength(1);
  });

  it("soft-deletes a turma", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/turmas",
      headers: { cookie: authCookie },
      payload: { nome: "Para Remover", serie: "8º Ano", escolaId, periodoId }
    });
    const { id } = createRes.json();

    const deleteRes = await app.inject({
      method: "DELETE",
      url: `/turmas/${id}`,
      headers: { cookie: authCookie }
    });
    expect(deleteRes.statusCode).toBe(200);

    const listRes = await app.inject({
      method: "GET",
      url: "/turmas",
      headers: { cookie: authCookie }
    });
    expect(listRes.json().items).toHaveLength(0);
  });
});
