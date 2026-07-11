import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "../../core/prisma.js";
import { professorService, ProfessorNotFoundError } from "./professores.service.js";

describe("professorService", () => {
  let escolaId: string;

  beforeEach(async () => {
    await prisma.professor.deleteMany();
    await prisma.escola.deleteMany({ where: { nome: { contains: "professores-test" } } });
    const escola = await prisma.escola.create({ data: { nome: "Escola professores-test" } });
    escolaId = escola.id;
  });

  afterAll(async () => {
    // Escola/Periodo/Materia are now FK-referenced by Professor/Turma, so an
    // unscoped deleteMany() in another test file (e.g. escolas.service.test.ts)
    // would fail if this file's last-created rows were left dangling.
    await prisma.professor.deleteMany();
    await prisma.escola.deleteMany({ where: { nome: { contains: "professores-test" } } });
    await prisma.$disconnect();
  });

  it("creates and retrieves a professor with its escola", async () => {
    const created = await professorService.create({ nome: "Fulano", escolaId });
    const found = await professorService.getById(created.id);
    expect(found.nome).toBe("Fulano");
    expect(found.escola.id).toBe(escolaId);
  });

  it("throws ProfessorNotFoundError for missing id", async () => {
    await expect(professorService.getById("00000000-0000-0000-0000-000000000000")).rejects.toThrow(
      ProfessorNotFoundError
    );
  });

  it("lists only active professores after soft delete", async () => {
    const a = await professorService.create({ nome: "Professor A", escolaId });
    await professorService.create({ nome: "Professor B", escolaId });
    await professorService.remove(a.id);

    const { items, total } = await professorService.list(1, 10);
    expect(total).toBe(1);
    expect(items.map((p) => p.nome)).toEqual(["Professor B"]);
  });

  it("rejects creating a professor with an empty nome", async () => {
    await expect(professorService.create({ nome: "", escolaId })).rejects.toThrow();
  });

  it("rejects creating a professor without escolaId", async () => {
    await expect(professorService.create({ nome: "Sem Escola", escolaId: "" })).rejects.toThrow();
  });
});
