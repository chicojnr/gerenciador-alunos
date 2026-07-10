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
    const created = await materiaService.create({ nome: "Matemática" });
    const found = await materiaService.getById(created.id);
    expect(found.nome).toBe("Matemática");
    expect(found.ativo).toBe(true);
  });

  it("throws MateriaNotFoundError for missing id", async () => {
    await expect(materiaService.getById("00000000-0000-0000-0000-000000000000")).rejects.toThrow(
      MateriaNotFoundError
    );
  });

  it("lists only active materias after soft delete", async () => {
    const a = await materiaService.create({ nome: "Matemática" });
    await materiaService.create({ nome: "Português" });
    await materiaService.remove(a.id);

    const { items, total } = await materiaService.list(1, 10);
    expect(total).toBe(1);
    expect(items.map((m) => m.nome)).toEqual(["Português"]);
  });

  it("rejects creating a materia with an empty nome", async () => {
    await expect(materiaService.create({ nome: "" })).rejects.toThrow();
  });

  it("rejects creating a materia with a duplicate nome", async () => {
    await materiaService.create({ nome: "Matemática" });
    await expect(materiaService.create({ nome: "Matemática" })).rejects.toThrow();
  });
});
