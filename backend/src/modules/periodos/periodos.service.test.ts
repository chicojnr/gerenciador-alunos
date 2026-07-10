import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "../../core/prisma.js";
import { periodoService, PeriodoNotFoundError } from "./periodos.service.js";

describe("periodoService", () => {
  beforeEach(async () => {
    await prisma.periodo.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates and retrieves a periodo", async () => {
    const created = await periodoService.create({ nome: "Diurno" });
    const found = await periodoService.getById(created.id);
    expect(found.nome).toBe("Diurno");
    expect(found.ativo).toBe(true);
  });

  it("throws PeriodoNotFoundError for missing id", async () => {
    await expect(periodoService.getById("00000000-0000-0000-0000-000000000000")).rejects.toThrow(
      PeriodoNotFoundError
    );
  });

  it("lists only active periodos after soft delete", async () => {
    const a = await periodoService.create({ nome: "Diurno" });
    await periodoService.create({ nome: "Noturno" });
    await periodoService.remove(a.id);

    const { items, total } = await periodoService.list(1, 10);
    expect(total).toBe(1);
    expect(items.map((p) => p.nome)).toEqual(["Noturno"]);
  });

  it("rejects creating a periodo with an empty nome", async () => {
    await expect(periodoService.create({ nome: "" })).rejects.toThrow();
  });

  it("rejects creating a periodo with a duplicate nome", async () => {
    await periodoService.create({ nome: "Diurno" });
    await expect(periodoService.create({ nome: "Diurno" })).rejects.toThrow();
  });
});
