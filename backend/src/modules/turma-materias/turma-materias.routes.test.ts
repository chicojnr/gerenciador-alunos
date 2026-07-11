import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../app.js";
import { prisma } from "../../core/prisma.js";
import { loadConfig } from "../../core/config.js";
import { signAccessToken } from "../../core/jwt.js";
import { hashPassword } from "../../core/password.js";

describe("turma-materias routes", () => {
  let app: FastifyInstance;
  let authCookie: string;
  let turmaId: string;
  let materiaId: string;
  let professorId: string;

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
    await prisma.turmaMateria.deleteMany();
    await prisma.turma.deleteMany({ where: { nome: { contains: "turma-materias-test" } } });
    await prisma.professor.deleteMany({ where: { nome: { contains: "turma-materias-test" } } });
    await prisma.escola.deleteMany({ where: { nome: { contains: "turma-materias-test" } } });
    await prisma.periodo.deleteMany({ where: { nome: { contains: "turma-materias-test" } } });
    await prisma.materia.deleteMany({ where: { nome: { contains: "turma-materias-test" } } });

    const escola = await prisma.escola.create({ data: { nome: "Escola turma-materias-test" } });
    const periodo = await prisma.periodo.create({ data: { nome: "Periodo turma-materias-test" } });
    const materia = await prisma.materia.create({ data: { nome: "Materia turma-materias-test" } });
    const professor = await prisma.professor.create({
      data: { nome: "Professor turma-materias-test", escolaId: escola.id }
    });
    const turma = await prisma.turma.create({
      data: {
        nome: "Turma turma-materias-test",
        serie: "6º Ano",
        escolaId: escola.id,
        periodoId: periodo.id
      }
    });

    turmaId = turma.id;
    materiaId = materia.id;
    professorId = professor.id;
  });

  afterAll(async () => {
    await prisma.turmaMateria.deleteMany();
    await prisma.turma.deleteMany({ where: { nome: { contains: "turma-materias-test" } } });
    await prisma.professor.deleteMany({ where: { nome: { contains: "turma-materias-test" } } });
    await prisma.escola.deleteMany({ where: { nome: { contains: "turma-materias-test" } } });
    await prisma.periodo.deleteMany({ where: { nome: { contains: "turma-materias-test" } } });
    await prisma.materia.deleteMany({ where: { nome: { contains: "turma-materias-test" } } });
    await app.close();
    await prisma.$disconnect();
  });

  it("rejects unauthenticated requests", async () => {
    const response = await app.inject({ method: "GET", url: `/turmas/${turmaId}/materias` });
    expect(response.statusCode).toBe(401);
  });

  it("assigns a materia+professor to a turma, then lists it", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: `/turmas/${turmaId}/materias`,
      headers: { cookie: authCookie },
      payload: { materiaId, professorId }
    });
    expect(createRes.statusCode).toBe(201);
    expect(createRes.json().materia.id).toBe(materiaId);
    expect(createRes.json().professor.id).toBe(professorId);

    const listRes = await app.inject({
      method: "GET",
      url: `/turmas/${turmaId}/materias`,
      headers: { cookie: authCookie }
    });
    expect(listRes.json()).toHaveLength(1);
  });

  it("rejects assigning the same materia twice to the same turma", async () => {
    await app.inject({
      method: "POST",
      url: `/turmas/${turmaId}/materias`,
      headers: { cookie: authCookie },
      payload: { materiaId, professorId }
    });

    const dupRes = await app.inject({
      method: "POST",
      url: `/turmas/${turmaId}/materias`,
      headers: { cookie: authCookie },
      payload: { materiaId, professorId }
    });
    expect(dupRes.statusCode).toBe(400);
  });

  it("removes an assignment", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: `/turmas/${turmaId}/materias`,
      headers: { cookie: authCookie },
      payload: { materiaId, professorId }
    });
    const { id } = createRes.json();

    const deleteRes = await app.inject({
      method: "DELETE",
      url: `/turmas/${turmaId}/materias/${id}`,
      headers: { cookie: authCookie }
    });
    expect(deleteRes.statusCode).toBe(200);

    const listRes = await app.inject({
      method: "GET",
      url: `/turmas/${turmaId}/materias`,
      headers: { cookie: authCookie }
    });
    expect(listRes.json()).toHaveLength(0);
  });
});
