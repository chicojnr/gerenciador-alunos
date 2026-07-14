import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../app.js";
import { prisma } from "../../core/prisma.js";
import { loadConfig } from "../../core/config.js";
import { signAccessToken } from "../../core/jwt.js";
import { hashPassword } from "../../core/password.js";

describe("alunos routes", () => {
  let app: FastifyInstance;
  let authCookie: string;
  let turmaId: string;

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
    await prisma.alunoSituacaoHistorico.deleteMany();
    await prisma.aluno.deleteMany();
    await prisma.turma.deleteMany({ where: { nome: { contains: "alunos-routes-test" } } });
    await prisma.escola.deleteMany({ where: { nome: { contains: "alunos-routes-test" } } });
    await prisma.periodo.deleteMany({ where: { nome: { contains: "alunos-routes-test" } } });
    const escola = await prisma.escola.create({ data: { nome: "Escola alunos-routes-test" } });
    const periodo = await prisma.periodo.create({ data: { nome: "Periodo alunos-routes-test" } });
    const turma = await prisma.turma.create({
      data: {
        nome: "Turma alunos-routes-test",
        serie: "6 Ano",
        escolaId: escola.id,
        periodoId: periodo.id
      }
    });
    turmaId = turma.id;
  });

  afterAll(async () => {
    await prisma.alunoSituacaoHistorico.deleteMany();
    await prisma.aluno.deleteMany();
    await prisma.turma.deleteMany({ where: { nome: { contains: "alunos-routes-test" } } });
    await prisma.escola.deleteMany({ where: { nome: { contains: "alunos-routes-test" } } });
    await prisma.periodo.deleteMany({ where: { nome: { contains: "alunos-routes-test" } } });
    await app.close();
    await prisma.$disconnect();
  });

  it("rejects unauthenticated requests", async () => {
    const response = await app.inject({ method: "GET", url: "/alunos" });
    expect(response.statusCode).toBe(401);
  });

  it("creates then lists an aluno, with nested turma", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/alunos",
      headers: { cookie: authCookie },
      payload: { nome: "Aluno Teste", turmaId }
    });
    expect(createRes.statusCode).toBe(201);
    expect(createRes.json().turma.id).toBe(turmaId);
    expect(createRes.json().situacaoAtual.nome).toBe("Ativo");

    const listRes = await app.inject({
      method: "GET",
      url: "/alunos",
      headers: { cookie: authCookie }
    });
    expect(listRes.statusCode).toBe(200);
    expect(listRes.json().items).toHaveLength(1);
  });

  it("soft-deletes an aluno", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/alunos",
      headers: { cookie: authCookie },
      payload: { nome: "Para Remover", turmaId }
    });
    const { id } = createRes.json();

    const deleteRes = await app.inject({
      method: "DELETE",
      url: `/alunos/${id}`,
      headers: { cookie: authCookie }
    });
    expect(deleteRes.statusCode).toBe(200);

    const listRes = await app.inject({
      method: "GET",
      url: "/alunos",
      headers: { cookie: authCookie }
    });
    expect(listRes.json().items).toHaveLength(0);
  });
});
