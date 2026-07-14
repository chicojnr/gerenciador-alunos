import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../app.js";
import { prisma } from "../../core/prisma.js";
import { loadConfig } from "../../core/config.js";
import { signAccessToken } from "../../core/jwt.js";
import { hashPassword } from "../../core/password.js";

describe("situacoes-aluno routes", () => {
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
    await prisma.situacaoAluno.deleteMany({ where: { nome: { contains: "situacoes-routes-test" } } });
  });

  afterAll(async () => {
    await prisma.situacaoAluno.deleteMany({ where: { nome: { contains: "situacoes-routes-test" } } });
    await app.close();
    await prisma.$disconnect();
  });

  it("rejects unauthenticated requests", async () => {
    const response = await app.inject({ method: "GET", url: "/situacoes-aluno" });
    expect(response.statusCode).toBe(401);
  });

  it("creates then lists a situacao", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/situacoes-aluno",
      headers: { cookie: authCookie },
      payload: { nome: "Custom situacoes-routes-test" }
    });
    expect(createRes.statusCode).toBe(201);

    const listRes = await app.inject({
      method: "GET",
      url: "/situacoes-aluno",
      headers: { cookie: authCookie }
    });
    expect(listRes.statusCode).toBe(200);
    const body = listRes.json();
    expect(body.items.some((s: { nome: string }) => s.nome === "Custom situacoes-routes-test")).toBe(
      true
    );
  });

  it("soft-deletes a situacao", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/situacoes-aluno",
      headers: { cookie: authCookie },
      payload: { nome: "Para Remover situacoes-routes-test" }
    });
    const { id } = createRes.json();

    const deleteRes = await app.inject({
      method: "DELETE",
      url: `/situacoes-aluno/${id}`,
      headers: { cookie: authCookie }
    });
    expect(deleteRes.statusCode).toBe(200);

    const getRes = await app.inject({
      method: "GET",
      url: `/situacoes-aluno/${id}`,
      headers: { cookie: authCookie }
    });
    expect(getRes.json().ativo).toBe(false);
  });
});
