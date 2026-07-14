import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "../../core/prisma.js";
import { alunoService, AlunoNotFoundError } from "./alunos.service.js";

describe("alunoService", () => {
  let turmaId: string;

  beforeEach(async () => {
    await prisma.alunoSituacaoHistorico.deleteMany();
    await prisma.aluno.deleteMany();
    await prisma.turma.deleteMany({ where: { nome: { contains: "alunos-test" } } });
    await prisma.escola.deleteMany({ where: { nome: { contains: "alunos-test" } } });
    await prisma.periodo.deleteMany({ where: { nome: { contains: "alunos-test" } } });
    const escola = await prisma.escola.create({ data: { nome: "Escola alunos-test" } });
    const periodo = await prisma.periodo.create({ data: { nome: "Periodo alunos-test" } });
    const turma = await prisma.turma.create({
      data: { nome: "Turma alunos-test", serie: "6 Ano", escolaId: escola.id, periodoId: periodo.id }
    });
    turmaId = turma.id;
  });

  afterAll(async () => {
    await prisma.alunoSituacaoHistorico.deleteMany();
    await prisma.aluno.deleteMany();
    await prisma.turma.deleteMany({ where: { nome: { contains: "alunos-test" } } });
    await prisma.escola.deleteMany({ where: { nome: { contains: "alunos-test" } } });
    await prisma.periodo.deleteMany({ where: { nome: { contains: "alunos-test" } } });
    await prisma.$disconnect();
  });

  it("creates and retrieves an aluno with its turma", async () => {
    const created = await alunoService.create({ nome: "Fulano", turmaId });
    const found = await alunoService.getById(created.id);
    expect(found.nome).toBe("Fulano");
    expect(found.turma.id).toBe(turmaId);
  });

  it("assigns the default situacao 'Ativo' on creation", async () => {
    const created = await alunoService.create({ nome: "Beltrano", turmaId });
    expect(created.situacaoAtual.nome).toBe("Ativo");
  });

  it("throws AlunoNotFoundError for missing id", async () => {
    await expect(alunoService.getById("00000000-0000-0000-0000-000000000000")).rejects.toThrow(
      AlunoNotFoundError
    );
  });

  it("lists only active alunos after soft delete", async () => {
    const a = await alunoService.create({ nome: "Aluno A", turmaId });
    await alunoService.create({ nome: "Aluno B", turmaId });
    await alunoService.remove(a.id);

    const { items, total } = await alunoService.list(1, 10);
    expect(total).toBe(1);
    expect(items.map((s) => s.nome)).toEqual(["Aluno B"]);
  });

  it("rejects creating an aluno with an empty nome", async () => {
    await expect(alunoService.create({ nome: "", turmaId })).rejects.toThrow();
  });
});
