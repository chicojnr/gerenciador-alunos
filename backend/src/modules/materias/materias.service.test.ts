import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "../../core/prisma.js";
import { materiaService, MateriaNotFoundError } from "./materias.service.js";

describe("materiaService", () => {
  beforeEach(async () => {
    await prisma.materia.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates and retrieves a materia", async () => {
    const created = await materiaService.create({ nome: "Matemática", codigo: "MAT1" });
    const found = await materiaService.getById(created.id);
    expect(found.nome).toBe("Matemática");
    expect(found.codigo).toBe("MAT1");
    expect(found.ativo).toBe(true);
  });

  it("throws MateriaNotFoundError for missing id", async () => {
    await expect(materiaService.getById("00000000-0000-0000-0000-000000000000")).rejects.toThrow(
      MateriaNotFoundError
    );
  });

  it("lists only active materias after soft delete", async () => {
    const a = await materiaService.create({ nome: "Matemática", codigo: "MAT1" });
    await materiaService.create({ nome: "Português", codigo: "POR1" });
    await materiaService.remove(a.id);

    const { items, total } = await materiaService.list(1, 10);
    expect(total).toBe(1);
    expect(items.map((m) => m.nome)).toEqual(["Português"]);
  });

  it("rejects creating a materia with an empty nome", async () => {
    await expect(materiaService.create({ nome: "", codigo: "MAT1" })).rejects.toThrow();
  });

  it("rejects creating a materia without codigo", async () => {
    await expect(materiaService.create({ nome: "Matemática", codigo: "" })).rejects.toThrow();
  });

  it("rejects creating a materia with a duplicate codigo", async () => {
    await materiaService.create({ nome: "Matemática 1ª série", codigo: "MAT1" });
    await expect(
      materiaService.create({ nome: "Matemática 2ª série", codigo: "MAT1" })
    ).rejects.toThrow();
  });

  it("allows repeated nome as long as codigo differs", async () => {
    await materiaService.create({ nome: "Matemática", codigo: "MAT1" });
    await expect(
      materiaService.create({ nome: "Matemática", codigo: "MAT4" })
    ).resolves.toBeDefined();
  });

  it("reactivates a soft-deleted materia instead of failing on duplicate codigo", async () => {
    const created = await materiaService.create({ nome: "Arte", codigo: "ART1" });
    await materiaService.remove(created.id);

    const recreated = await materiaService.create({ nome: "Arte Renomeada", codigo: "ART1" });

    expect(recreated.id).toBe(created.id);
    expect(recreated.nome).toBe("Arte Renomeada");
    expect(recreated.ativo).toBe(true);
  });
});
