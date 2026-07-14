import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../app.js";
import { prisma } from "../../core/prisma.js";
import { loadConfig } from "../../core/config.js";
import { signAccessToken } from "../../core/jwt.js";
import { hashPassword } from "../../core/password.js";
import { alunoService } from "../alunos/alunos.service.js";

describe("aluno-situacoes routes", () => {
  let app: FastifyInstance;
  let authCookie: string;
  let alunoId: string;
  let transferidoId: string;

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
    const transferido = await prisma.situacaoAluno.findUniqueOrThrow({ where: { nome: "Transferido" } });
    transferidoId = transferido.id;
  });

  beforeEach(async () => {
    await prisma.alunoSituacaoHistorico.deleteMany();
    await prisma.aluno.deleteMany({ where: { nome: { contains: "aluno-sit-routes-test" } } });
    await prisma.turma.deleteMany({ where: { nome: { contains: "aluno-sit-routes-test" } } });
    await prisma.escola.deleteMany({ where: { nome: { contains: "aluno-sit-routes-test" } } });
    await prisma.periodo.deleteMany({ where: { nome: { contains: "aluno-sit-routes-test" } } });

    const escola = await prisma.escola.create({ data: { nome: "Escola aluno-sit-routes-test" } });
    const periodo = await prisma.periodo.create({ data: { nome: "Periodo aluno-sit-routes-test" } });
    const turma = await prisma.turma.create({
      data: {
        nome: "Turma aluno-sit-routes-test",
        serie: "6 Ano",
        escolaId: escola.id,
        periodoId: periodo.id
      }
    });
    const aluno = await alunoService.create({
      nome: "Aluno aluno-sit-routes-test",
      turmaId: turma.id
    });
    alunoId = aluno.id;
  });

  afterAll(async () => {
    await prisma.alunoSituacaoHistorico.deleteMany();
    await prisma.aluno.deleteMany({ where: { nome: { contains: "aluno-sit-routes-test" } } });
    await prisma.turma.deleteMany({ where: { nome: { contains: "aluno-sit-routes-test" } } });
    await prisma.escola.deleteMany({ where: { nome: { contains: "aluno-sit-routes-test" } } });
    await prisma.periodo.deleteMany({ where: { nome: { contains: "aluno-sit-routes-test" } } });
    await app.close();
    await prisma.$disconnect();
  });

  it("rejects unauthenticated requests", async () => {
    const response = await app.inject({ method: "GET", url: `/alunos/${alunoId}/situacoes` });
    expect(response.statusCode).toBe(401);
  });

  it("changes situacao and lists history", async () => {
    const changeRes = await app.inject({
      method: "POST",
      url: `/alunos/${alunoId}/situacoes`,
      headers: { cookie: authCookie },
      payload: { situacaoId: transferidoId, dataMudanca: "2026-08-01" }
    });
    expect(changeRes.statusCode).toBe(201);
    expect(changeRes.json().situacao.nome).toBe("Transferido");

    const listRes = await app.inject({
      method: "GET",
      url: `/alunos/${alunoId}/situacoes`,
      headers: { cookie: authCookie }
    });
    expect(listRes.json()).toHaveLength(2);
  });
});
