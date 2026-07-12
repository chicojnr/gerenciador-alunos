import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../app.js";
import { prisma } from "../../core/prisma.js";
import { loadConfig } from "../../core/config.js";
import { signAccessToken } from "../../core/jwt.js";
import { hashPassword } from "../../core/password.js";

describe("notas routes", () => {
  let app: FastifyInstance;
  let authCookie: string;
  let turmaId: string;
  let materiaId: string;
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
    await prisma.nota.deleteMany();
    await prisma.aluno.deleteMany({ where: { nome: { contains: "notas-test" } } });
    await prisma.turma.deleteMany({ where: { nome: { contains: "notas-test" } } });
    await prisma.materia.deleteMany({ where: { nome: { contains: "notas-test" } } });
    await prisma.escola.deleteMany({ where: { nome: { contains: "notas-test" } } });
    await prisma.periodo.deleteMany({ where: { nome: { contains: "notas-test" } } });

    const escola = await prisma.escola.create({ data: { nome: "Escola notas-test" } });
    const periodo = await prisma.periodo.create({ data: { nome: "Periodo notas-test" } });
    const materia = await prisma.materia.create({ data: { nome: "Materia notas-test" } });
    const turma = await prisma.turma.create({
      data: { nome: "Turma notas-test", serie: "6 Ano", escolaId: escola.id, periodoId: periodo.id }
    });
    const aluno = await prisma.aluno.create({ data: { nome: "Aluno notas-test", turmaId: turma.id } });

    turmaId = turma.id;
    materiaId = materia.id;
    alunoId = aluno.id;
  });

  afterAll(async () => {
    await prisma.nota.deleteMany();
    await prisma.aluno.deleteMany({ where: { nome: { contains: "notas-test" } } });
    await prisma.turma.deleteMany({ where: { nome: { contains: "notas-test" } } });
    await prisma.materia.deleteMany({ where: { nome: { contains: "notas-test" } } });
    await prisma.escola.deleteMany({ where: { nome: { contains: "notas-test" } } });
    await prisma.periodo.deleteMany({ where: { nome: { contains: "notas-test" } } });
    await app.close();
    await prisma.$disconnect();
  });

  it("rejects unauthenticated requests", async () => {
    const response = await app.inject({ method: "POST", url: "/notas/lote", payload: {} });
    expect(response.statusCode).toBe(401);
  });

  it("launches notas in batch and reads them back, upserting on re-launch", async () => {
    const primeira = await app.inject({
      method: "POST",
      url: "/notas/lote",
      headers: { cookie: authCookie },
      payload: { materiaId, bimestre: 2, notas: [{ alunoId, valor: 7.5 }] }
    });
    expect(primeira.statusCode).toBe(200);

    await app.inject({
      method: "POST",
      url: "/notas/lote",
      headers: { cookie: authCookie },
      payload: { materiaId, bimestre: 2, notas: [{ alunoId, valor: 8.0 }] }
    });

    const consulta = await app.inject({
      method: "GET",
      url: `/notas?turmaId=${turmaId}&materiaId=${materiaId}&bimestre=2`,
      headers: { cookie: authCookie }
    });
    expect(consulta.statusCode).toBe(200);
    expect(consulta.json().notas).toEqual([{ alunoId, valor: 8.0 }]);
  });

  it("clears a nota when relaunched with valor null", async () => {
    await app.inject({
      method: "POST",
      url: "/notas/lote",
      headers: { cookie: authCookie },
      payload: { materiaId, bimestre: 3, notas: [{ alunoId, valor: 7 }] }
    });
    await app.inject({
      method: "POST",
      url: "/notas/lote",
      headers: { cookie: authCookie },
      payload: { materiaId, bimestre: 3, notas: [{ alunoId, valor: null }] }
    });

    const consulta = await app.inject({
      method: "GET",
      url: `/notas?turmaId=${turmaId}&materiaId=${materiaId}&bimestre=3`,
      headers: { cookie: authCookie }
    });
    expect(consulta.json().notas).toEqual([]);
  });

  it("rejects a nota outside the 0-10 range", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/notas/lote",
      headers: { cookie: authCookie },
      payload: { materiaId, bimestre: 1, notas: [{ alunoId, valor: 11 }] }
    });
    expect(response.statusCode).toBe(400);
  });

  it("rejects an invalid bimestre", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/notas/lote",
      headers: { cookie: authCookie },
      payload: { materiaId, bimestre: 5, notas: [] }
    });
    expect(response.statusCode).toBe(400);
  });
});
