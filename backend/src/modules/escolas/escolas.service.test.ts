import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "../../core/prisma.js";
import { escolaService, EscolaNotFoundError } from "./escolas.service.js";

describe("escolaService", () => {
  beforeEach(async () => {
    await prisma.escola.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates and retrieves an escola", async () => {
    const created = await escolaService.create({ nome: "Escola Central" });
    const found = await escolaService.getById(created.id);
    expect(found.nome).toBe("Escola Central");
    expect(found.ativo).toBe(true);
  });

  it("throws EscolaNotFoundError for missing id", async () => {
    await expect(escolaService.getById("00000000-0000-0000-0000-000000000000")).rejects.toThrow(
      EscolaNotFoundError
    );
  });

  it("lists only active escolas after soft delete", async () => {
    const a = await escolaService.create({ nome: "Escola A" });
    await escolaService.create({ nome: "Escola B" });
    await escolaService.remove(a.id);

    const { items, total } = await escolaService.list(1, 10);
    expect(total).toBe(1);
    expect(items.map((e) => e.nome)).toEqual(["Escola B"]);
  });

  it("rejects creating an escola with an empty nome", async () => {
    await expect(escolaService.create({ nome: "" })).rejects.toThrow();
  });
});
