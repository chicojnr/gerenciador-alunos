import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../app.js";
import { prisma } from "../../core/prisma.js";
import { loadConfig } from "../../core/config.js";
import { signAccessToken } from "../../core/jwt.js";
import { hashPassword } from "../../core/password.js";

describe("aluno-responsaveis routes", () => {
  let app: FastifyInstance;
  let authCookie: string;
  let alunoId: string;
  let responsavelId: string;

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
    await prisma.alunoResponsavel.deleteMany();
    await prisma.aluno.deleteMany({ where: { nome: { contains: "aluno-resp-test" } } });
    await prisma.responsavel.deleteMany({ where: { nome: { contains: "aluno-resp-test" } } });
    await prisma.turma.deleteMany({ where: { nome: { contains: "aluno-resp-test" } } });
    await prisma.escola.deleteMany({ where: { nome: { contains: "aluno-resp-test" } } });
    await prisma.periodo.deleteMany({ where: { nome: { contains: "aluno-resp-test" } } });

    const escola = await prisma.escola.create({ data: { nome: "Escola aluno-resp-test" } });
    const periodo = await prisma.periodo.create({ data: { nome: "Periodo aluno-resp-test" } });
    const turma = await prisma.turma.create({
      data: {
        nome: "Turma aluno-resp-test",
        serie: "6 Ano",
        escolaId: escola.id,
        periodoId: periodo.id
      }
    });
    const situacaoAtiva = await prisma.situacaoAluno.findUniqueOrThrow({ where: { nome: "Ativo" } });
    const aluno = await prisma.aluno.create({
      data: { nome: "Aluno aluno-resp-test", turmaId: turma.id, situacaoAtualId: situacaoAtiva.id }
    });
    const responsavel = await prisma.responsavel.create({
      data: { nome: "Responsavel aluno-resp-test" }
    });

    alunoId = aluno.id;
    responsavelId = responsavel.id;
  });

  afterAll(async () => {
    await prisma.alunoResponsavel.deleteMany();
    await prisma.aluno.deleteMany({ where: { nome: { contains: "aluno-resp-test" } } });
    await prisma.responsavel.deleteMany({ where: { nome: { contains: "aluno-resp-test" } } });
    await prisma.turma.deleteMany({ where: { nome: { contains: "aluno-resp-test" } } });
    await prisma.escola.deleteMany({ where: { nome: { contains: "aluno-resp-test" } } });
    await prisma.periodo.deleteMany({ where: { nome: { contains: "aluno-resp-test" } } });
    await app.close();
    await prisma.$disconnect();
  });

  it("rejects unauthenticated requests", async () => {
    const response = await app.inject({ method: "GET", url: `/alunos/${alunoId}/responsaveis` });
    expect(response.statusCode).toBe(401);
  });

  it("links a responsavel to an aluno, then lists it", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: `/alunos/${alunoId}/responsaveis`,
      headers: { cookie: authCookie },
      payload: { responsavelId }
    });
    expect(createRes.statusCode).toBe(201);
    expect(createRes.json().responsavel.id).toBe(responsavelId);

    const listRes = await app.inject({
      method: "GET",
      url: `/alunos/${alunoId}/responsaveis`,
      headers: { cookie: authCookie }
    });
    expect(listRes.json()).toHaveLength(1);
  });

  it("rejects linking the same responsavel twice to the same aluno", async () => {
    await app.inject({
      method: "POST",
      url: `/alunos/${alunoId}/responsaveis`,
      headers: { cookie: authCookie },
      payload: { responsavelId }
    });

    const dupRes = await app.inject({
      method: "POST",
      url: `/alunos/${alunoId}/responsaveis`,
      headers: { cookie: authCookie },
      payload: { responsavelId }
    });
    expect(dupRes.statusCode).toBe(400);
  });

  it("removes a link", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: `/alunos/${alunoId}/responsaveis`,
      headers: { cookie: authCookie },
      payload: { responsavelId }
    });
    const { id } = createRes.json();

    const deleteRes = await app.inject({
      method: "DELETE",
      url: `/alunos/${alunoId}/responsaveis/${id}`,
      headers: { cookie: authCookie }
    });
    expect(deleteRes.statusCode).toBe(200);

    const listRes = await app.inject({
      method: "GET",
      url: `/alunos/${alunoId}/responsaveis`,
      headers: { cookie: authCookie }
    });
    expect(listRes.json()).toHaveLength(0);
  });
});
