import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../app.js";
import { prisma } from "../../core/prisma.js";
import { loadConfig } from "../../core/config.js";
import { signAccessToken } from "../../core/jwt.js";
import { hashPassword } from "../../core/password.js";

describe("mensagens routes", () => {
  let app: FastifyInstance;
  let authCookie: string;
  let alunoComResponsavelId: string;
  let alunoSemResponsavelId: string;
  let templateId: string;

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
    await prisma.envioMensagem.deleteMany();
    await prisma.mensagemTemplate.deleteMany();
    await prisma.alunoResponsavel.deleteMany();
    await prisma.aluno.deleteMany({ where: { nome: { contains: "mensagens-test" } } });
    await prisma.responsavel.deleteMany({ where: { nome: { contains: "mensagens-test" } } });
    await prisma.turma.deleteMany({ where: { nome: { contains: "mensagens-test" } } });
    await prisma.escola.deleteMany({ where: { nome: { contains: "mensagens-test" } } });
    await prisma.periodo.deleteMany({ where: { nome: { contains: "mensagens-test" } } });

    const escola = await prisma.escola.create({ data: { nome: "Escola mensagens-test" } });
    const periodo = await prisma.periodo.create({ data: { nome: "Periodo mensagens-test" } });
    const turma = await prisma.turma.create({
      data: {
        nome: "Turma mensagens-test",
        serie: "6 Ano",
        escolaId: escola.id,
        periodoId: periodo.id
      }
    });
    const alunoCom = await prisma.aluno.create({
      data: { nome: "Aluno Com mensagens-test", turmaId: turma.id }
    });
    const alunoSem = await prisma.aluno.create({
      data: { nome: "Aluno Sem mensagens-test", turmaId: turma.id }
    });
    const responsavel = await prisma.responsavel.create({
      data: { nome: "Mae mensagens-test", telefone: "11999998888" }
    });
    await prisma.alunoResponsavel.create({
      data: { alunoId: alunoCom.id, responsavelId: responsavel.id }
    });
    const template = await prisma.mensagemTemplate.create({
      data: {
        nome: "Alerta de faltas mensagens-test",
        conteudo: "Olá {responsavel}, o aluno {aluno} atingiu o limite de faltas."
      }
    });

    alunoComResponsavelId = alunoCom.id;
    alunoSemResponsavelId = alunoSem.id;
    templateId = template.id;
  });

  afterAll(async () => {
    await prisma.envioMensagem.deleteMany();
    await prisma.mensagemTemplate.deleteMany();
    await prisma.alunoResponsavel.deleteMany();
    await prisma.aluno.deleteMany({ where: { nome: { contains: "mensagens-test" } } });
    await prisma.responsavel.deleteMany({ where: { nome: { contains: "mensagens-test" } } });
    await prisma.turma.deleteMany({ where: { nome: { contains: "mensagens-test" } } });
    await prisma.escola.deleteMany({ where: { nome: { contains: "mensagens-test" } } });
    await prisma.periodo.deleteMany({ where: { nome: { contains: "mensagens-test" } } });
    await app.close();
    await prisma.$disconnect();
  });

  it("rejects unauthenticated requests", async () => {
    const response = await app.inject({ method: "GET", url: "/mensagens/templates" });
    expect(response.statusCode).toBe(401);
  });

  it("creates a template and lists it", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/mensagens/templates",
      headers: { cookie: authCookie },
      payload: { nome: "Novo template mensagens-test", conteudo: "Oi {aluno}" }
    });
    expect(createRes.statusCode).toBe(201);

    const listRes = await app.inject({
      method: "GET",
      url: "/mensagens/templates",
      headers: { cookie: authCookie }
    });
    expect(listRes.json().items.length).toBeGreaterThanOrEqual(2);
  });

  it("registers envios with rendered placeholders and reports alunos sem responsável", async () => {
    const envioRes = await app.inject({
      method: "POST",
      url: "/mensagens/envios",
      headers: { cookie: authCookie },
      payload: { templateId, alunoIds: [alunoComResponsavelId, alunoSemResponsavelId] }
    });
    expect(envioRes.statusCode).toBe(201);
    const body = envioRes.json();
    expect(body.registrados).toBe(1);
    expect(body.semResponsavel.map((a: { id: string }) => a.id)).toEqual([alunoSemResponsavelId]);

    const envio = await prisma.envioMensagem.findFirstOrThrow({
      where: { alunoId: alunoComResponsavelId }
    });
    expect(envio.mensagem).toBe(
      "Olá Mae mensagens-test, o aluno Aluno Com mensagens-test atingiu o limite de faltas."
    );
    expect(envio.telefone).toBe("11999998888");
    expect(envio.status).toBe("REGISTRADO");
  });

  it("rejects an envio with no alunos selected", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/mensagens/envios",
      headers: { cookie: authCookie },
      payload: { templateId, alunoIds: [] }
    });
    expect(response.statusCode).toBe(400);
  });
});
