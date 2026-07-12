import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../app.js";
import { prisma } from "../../core/prisma.js";
import { loadConfig } from "../../core/config.js";
import { signAccessToken } from "../../core/jwt.js";
import { hashPassword } from "../../core/password.js";

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
}

describe("faltas + indicadores routes", () => {
  let app: FastifyInstance;
  let authCookie: string;
  let escolaId: string;
  let turmaId: string;
  let alunoId: string;

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
    await prisma.falta.deleteMany();
    await prisma.indicadorFalta.deleteMany();
    await prisma.diaNaoLetivo.deleteMany();
    await prisma.aluno.deleteMany({ where: { nome: { contains: "faltas-test" } } });
    await prisma.turma.deleteMany({ where: { nome: { contains: "faltas-test" } } });
    await prisma.escola.deleteMany({ where: { nome: { contains: "faltas-test" } } });
    await prisma.periodo.deleteMany({ where: { nome: { contains: "faltas-test" } } });

    const escola = await prisma.escola.create({ data: { nome: "Escola faltas-test" } });
    const periodo = await prisma.periodo.create({ data: { nome: "Periodo faltas-test" } });
    const turma = await prisma.turma.create({
      data: { nome: "Turma faltas-test", serie: "6 Ano", escolaId: escola.id, periodoId: periodo.id }
    });
    const aluno = await prisma.aluno.create({
      data: { nome: "Aluno faltas-test", turmaId: turma.id }
    });
    escolaId = escola.id;
    turmaId = turma.id;
    alunoId = aluno.id;
  });

  afterAll(async () => {
    await prisma.falta.deleteMany();
    await prisma.indicadorFalta.deleteMany();
    await prisma.diaNaoLetivo.deleteMany();
    await prisma.aluno.deleteMany({ where: { nome: { contains: "faltas-test" } } });
    await prisma.turma.deleteMany({ where: { nome: { contains: "faltas-test" } } });
    await prisma.escola.deleteMany({ where: { nome: { contains: "faltas-test" } } });
    await prisma.periodo.deleteMany({ where: { nome: { contains: "faltas-test" } } });
    await app.close();
    await prisma.$disconnect();
  });

  it("rejects unauthenticated requests", async () => {
    const response = await app.inject({ method: "POST", url: "/faltas/registro", payload: {} });
    expect(response.statusCode).toBe(401);
  });

  it("registers a day's faltas and reads them back", async () => {
    const data = isoDaysAgo(0);
    const registro = await app.inject({
      method: "POST",
      url: "/faltas/registro",
      headers: { cookie: authCookie },
      payload: { turmaId, data, alunoIds: [alunoId] }
    });
    expect(registro.statusCode).toBe(200);

    const dia = await app.inject({
      method: "GET",
      url: `/faltas/dia?turmaId=${turmaId}&data=${data}`,
      headers: { cookie: authCookie }
    });
    expect(dia.json().alunoIds).toEqual([alunoId]);
  });

  it("re-registering a day replaces the previous faltas", async () => {
    const data = isoDaysAgo(0);
    await app.inject({
      method: "POST",
      url: "/faltas/registro",
      headers: { cookie: authCookie },
      payload: { turmaId, data, alunoIds: [alunoId] }
    });
    await app.inject({
      method: "POST",
      url: "/faltas/registro",
      headers: { cookie: authCookie },
      payload: { turmaId, data, alunoIds: [] }
    });

    const dia = await app.inject({
      method: "GET",
      url: `/faltas/dia?turmaId=${turmaId}&data=${data}`,
      headers: { cookie: authCookie }
    });
    expect(dia.json().alunoIds).toEqual([]);
  });

  it("rejects registering alunos that don't belong to the turma", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/faltas/registro",
      headers: { cookie: authCookie },
      payload: { turmaId, data: isoDaysAgo(0), alunoIds: ["00000000-0000-0000-0000-000000000000"] }
    });
    expect(response.statusCode).toBe(400);
  });

  it("flags an aluno on a consecutive-days indicator after 3 straight faltas", async () => {
    for (const dias of [0, 1, 2]) {
      await app.inject({
        method: "POST",
        url: "/faltas/registro",
        headers: { cookie: authCookie },
        payload: { turmaId, data: isoDaysAgo(dias), alunoIds: [alunoId] }
      });
    }
    await app.inject({
      method: "POST",
      url: "/indicadores",
      headers: { cookie: authCookie },
      payload: { nome: "3 dias consecutivos", tipo: "CONSECUTIVAS", quantidade: 3, escolaId }
    });

    const avaliacao = await app.inject({
      method: "GET",
      url: "/indicadores/avaliacao",
      headers: { cookie: authCookie }
    });
    expect(avaliacao.statusCode).toBe(200);
    const body = avaliacao.json();
    expect(body).toHaveLength(1);
    expect(body[0].alunos.map((a: { id: string }) => a.id)).toContain(alunoId);
    expect(body[0].alunos[0].faltas).toBe(3);
  });

  it("does not flag an aluno below the indicator threshold", async () => {
    await app.inject({
      method: "POST",
      url: "/faltas/registro",
      headers: { cookie: authCookie },
      payload: { turmaId, data: isoDaysAgo(0), alunoIds: [alunoId] }
    });
    await app.inject({
      method: "POST",
      url: "/indicadores",
      headers: { cookie: authCookie },
      payload: { nome: "5 dias consecutivos", tipo: "CONSECUTIVAS", quantidade: 5, escolaId }
    });

    const avaliacao = await app.inject({
      method: "GET",
      url: "/indicadores/avaliacao",
      headers: { cookie: authCookie }
    });
    expect(avaliacao.json()[0].alunos).toHaveLength(0);
  });

  it("rejects a não-consecutivas indicator without janelaDias", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/indicadores",
      headers: { cookie: authCookie },
      payload: { nome: "3 não consecutivas", tipo: "NAO_CONSECUTIVAS", quantidade: 3, escolaId }
    });
    expect(response.statusCode).toBe(400);
  });

  it("flags an aluno on a non-consecutive indicator within the window", async () => {
    for (const dias of [0, 5, 12]) {
      await app.inject({
        method: "POST",
        url: "/faltas/registro",
        headers: { cookie: authCookie },
        payload: { turmaId, data: isoDaysAgo(dias), alunoIds: [alunoId] }
      });
    }
    await app.inject({
      method: "POST",
      url: "/indicadores",
      headers: { cookie: authCookie },
      payload: {
        nome: "3 em 30 dias",
        tipo: "NAO_CONSECUTIVAS",
        quantidade: 3,
        janelaDias: 30,
        escolaId
      }
    });

    const avaliacao = await app.inject({
      method: "GET",
      url: "/indicadores/avaliacao",
      headers: { cookie: authCookie }
    });
    const body = avaliacao.json();
    expect(body[0].alunos.map((a: { id: string }) => a.id)).toContain(alunoId);
  });

  it("bridges a consecutive-days streak across cadastros dias não letivos (feriado/ponte)", async () => {
    // Faltas em 5 e 2 dias atrás; os dois dias entre elas são cadastrados
    // como não letivos (feriado + ponte) — a sequência deve valer 2, não 0.
    await app.inject({
      method: "POST",
      url: "/faltas/registro",
      headers: { cookie: authCookie },
      payload: { turmaId, data: isoDaysAgo(5), alunoIds: [alunoId] }
    });
    await app.inject({
      method: "POST",
      url: "/faltas/registro",
      headers: { cookie: authCookie },
      payload: { turmaId, data: isoDaysAgo(2), alunoIds: [alunoId] }
    });
    await app.inject({
      method: "POST",
      url: `/escolas/${escolaId}/dias-nao-letivos`,
      headers: { cookie: authCookie },
      payload: { data: isoDaysAgo(4), tipo: "FERIADO", descricao: "Feriado faltas-test" }
    });
    await app.inject({
      method: "POST",
      url: `/escolas/${escolaId}/dias-nao-letivos`,
      headers: { cookie: authCookie },
      payload: { data: isoDaysAgo(3), tipo: "PONTE", descricao: "Ponte faltas-test" }
    });
    await app.inject({
      method: "POST",
      url: "/indicadores",
      headers: { cookie: authCookie },
      payload: { nome: "2 dias consecutivos", tipo: "CONSECUTIVAS", quantidade: 2, escolaId }
    });

    const avaliacao = await app.inject({
      method: "GET",
      url: "/indicadores/avaliacao",
      headers: { cookie: authCookie }
    });
    const body = avaliacao.json();
    expect(body[0].alunos.map((a: { id: string }) => a.id)).toContain(alunoId);
    expect(body[0].alunos[0].faltas).toBe(2);
  });
});
