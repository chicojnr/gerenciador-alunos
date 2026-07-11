import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "../../core/prisma.js";
import { responsavelService, ResponsavelNotFoundError } from "./responsaveis.service.js";

describe("responsavelService", () => {
  beforeEach(async () => {
    await prisma.responsavel.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates and retrieves a responsavel", async () => {
    const created = await responsavelService.create({ nome: "Mae Fulana", telefone: "11999999999" });
    const found = await responsavelService.getById(created.id);
    expect(found.nome).toBe("Mae Fulana");
  });

  it("throws ResponsavelNotFoundError for missing id", async () => {
    await expect(
      responsavelService.getById("00000000-0000-0000-0000-000000000000")
    ).rejects.toThrow(ResponsavelNotFoundError);
  });

  it("lists only active responsaveis after soft delete", async () => {
    const a = await responsavelService.create({ nome: "Responsavel A" });
    await responsavelService.create({ nome: "Responsavel B" });
    await responsavelService.remove(a.id);

    const { items, total } = await responsavelService.list(1, 10);
    expect(total).toBe(1);
    expect(items.map((r) => r.nome)).toEqual(["Responsavel B"]);
  });

  it("rejects creating a responsavel with an empty nome", async () => {
    await expect(responsavelService.create({ nome: "" })).rejects.toThrow();
  });
});
