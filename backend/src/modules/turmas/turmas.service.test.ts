import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "../../core/prisma.js";
import { turmaService, TurmaNotFoundError } from "./turmas.service.js";

describe("turmaService", () => {
  let escolaId: string;
  let periodoId: string;

  beforeEach(async () => {
    await prisma.turma.deleteMany();
    await prisma.escola.deleteMany({ where: { nome: { contains: "turmas-test" } } });
    await prisma.periodo.deleteMany({ where: { nome: { contains: "turmas-test" } } });
    const escola = await prisma.escola.create({ data: { nome: "Escola turmas-test" } });
    const periodo = await prisma.periodo.create({ data: { nome: "Periodo turmas-test" } });
    escolaId = escola.id;
    periodoId = periodo.id;
  });

  afterAll(async () => {
    await prisma.turma.deleteMany();
    await prisma.escola.deleteMany({ where: { nome: { contains: "turmas-test" } } });
    await prisma.periodo.deleteMany({ where: { nome: { contains: "turmas-test" } } });
    await prisma.$disconnect();
  });

  it("creates and retrieves a turma with escola and periodo", async () => {
    const created = await turmaService.create({
      nome: "Turma A",
      serie: "6º Ano",
      escolaId,
      periodoId
    });
    const found = await turmaService.getById(created.id);
    expect(found.nome).toBe("Turma A");
    expect(found.escola.id).toBe(escolaId);
    expect(found.periodo.id).toBe(periodoId);
  });

  it("throws TurmaNotFoundError for missing id", async () => {
    await expect(turmaService.getById("00000000-0000-0000-0000-000000000000")).rejects.toThrow(
      TurmaNotFoundError
    );
  });

  it("lists only active turmas after soft delete", async () => {
    const a = await turmaService.create({ nome: "Turma A", serie: "6º Ano", escolaId, periodoId });
    await turmaService.create({ nome: "Turma B", serie: "7º Ano", escolaId, periodoId });
    await turmaService.remove(a.id);

    const { items, total } = await turmaService.list(1, 10);
    expect(total).toBe(1);
    expect(items.map((t) => t.nome)).toEqual(["Turma B"]);
  });

  it("rejects creating a turma with an empty serie", async () => {
    await expect(
      turmaService.create({ nome: "Turma X", serie: "", escolaId, periodoId })
    ).rejects.toThrow();
  });
});
