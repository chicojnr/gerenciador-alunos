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
  let coordenadorUserId: string;

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
    await prisma.user.deleteMany({ where: { email: { contains: "resp-com-test" } } });
    const escola = await prisma.escola.create({ data: { nome: "Escola resp-com-test" } });
    const coordenador = await prisma.user.create({
      data: {
        email: "coordenador@resp-com-test.com",
        passwordHash: await hashPassword("x"),
        name: "Coordenador Teste"
      }
    });
    escolaId = escola.id;
    coordenadorUserId = coordenador.id;
  });

  afterAll(async () => {
    await prisma.responsavelComunicacao.deleteMany();
    await prisma.escola.deleteMany({ where: { nome: { contains: "resp-com-test" } } });
    await prisma.user.deleteMany({ where: { email: { contains: "resp-com-test" } } });
    await app.close();
    await prisma.$disconnect();
  });

  it("rejects unauthenticated requests", async () => {
    const response = await app.inject({ method: "GET", url: "/responsaveis-comunicacao" });
    expect(response.statusCode).toBe(401);
  });

  it("creates then lists a responsavel de comunicacao linked to a registered user", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/responsaveis-comunicacao",
      headers: { cookie: authCookie },
      payload: { userId: coordenadorUserId, escolaId }
    });
    expect(createRes.statusCode).toBe(201);
    expect(createRes.json().escola.id).toBe(escolaId);
    expect(createRes.json().user.name).toBe("Coordenador Teste");

    const listRes = await app.inject({
      method: "GET",
      url: "/responsaveis-comunicacao",
      headers: { cookie: authCookie }
    });
    expect(listRes.json().items).toHaveLength(1);
  });

  it("rejects a userId that does not belong to a registered user", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/responsaveis-comunicacao",
      headers: { cookie: authCookie },
      payload: { userId: "00000000-0000-0000-0000-000000000000", escolaId }
    });
    expect(response.statusCode).toBe(400);
  });

  it("rejects assigning the same user twice to the same escola", async () => {
    await app.inject({
      method: "POST",
      url: "/responsaveis-comunicacao",
      headers: { cookie: authCookie },
      payload: { userId: coordenadorUserId, escolaId }
    });
    const response = await app.inject({
      method: "POST",
      url: "/responsaveis-comunicacao",
      headers: { cookie: authCookie },
      payload: { userId: coordenadorUserId, escolaId }
    });
    expect(response.statusCode).toBe(400);
  });

  it("soft-deletes a responsavel de comunicacao", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/responsaveis-comunicacao",
      headers: { cookie: authCookie },
      payload: { userId: coordenadorUserId, escolaId }
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
