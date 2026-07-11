import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../app.js";
import { prisma } from "../../core/prisma.js";
import { loadConfig } from "../../core/config.js";
import { signAccessToken } from "../../core/jwt.js";
import { hashPassword } from "../../core/password.js";

describe("responsaveis-comunicacao routes", () => {
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
    await prisma.responsavelComunicacao.deleteMany();
    await prisma.escola.deleteMany({ where: { nome: { contains: "resp-com-test" } } });
    const escola = await prisma.escola.create({ data: { nome: "Escola resp-com-test" } });
    escolaId = escola.id;
  });

  afterAll(async () => {
    await prisma.responsavelComunicacao.deleteMany();
    await prisma.escola.deleteMany({ where: { nome: { contains: "resp-com-test" } } });
    await app.close();
    await prisma.$disconnect();
  });

  it("rejects unauthenticated requests", async () => {
    const response = await app.inject({ method: "GET", url: "/responsaveis-comunicacao" });
    expect(response.statusCode).toBe(401);
  });

  it("creates then lists a responsavel de comunicacao", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/responsaveis-comunicacao",
      headers: { cookie: authCookie },
      payload: { nome: "Coordenador Teste", escolaId }
    });
    expect(createRes.statusCode).toBe(201);
    expect(createRes.json().escola.id).toBe(escolaId);

    const listRes = await app.inject({
      method: "GET",
      url: "/responsaveis-comunicacao",
      headers: { cookie: authCookie }
    });
    expect(listRes.json().items).toHaveLength(1);
  });

  it("soft-deletes a responsavel de comunicacao", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/responsaveis-comunicacao",
      headers: { cookie: authCookie },
      payload: { nome: "Para Remover", escolaId }
    });
    const { id } = createRes.json();

    const deleteRes = await app.inject({
      method: "DELETE",
      url: `/responsaveis-comunicacao/${id}`,
      headers: { cookie: authCookie }
    });
    expect(deleteRes.statusCode).toBe(200);
  });
});
