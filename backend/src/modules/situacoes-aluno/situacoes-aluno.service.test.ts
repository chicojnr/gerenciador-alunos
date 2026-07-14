import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "../../core/prisma.js";
import { situacaoAlunoService, SituacaoAlunoNotFoundError } from "./situacoes-aluno.service.js";

describe("situacaoAlunoService", () => {
  beforeEach(async () => {
    await prisma.situacaoAluno.deleteMany({ where: { nome: { contains: "situacoes-test" } } });
  });

  afterAll(async () => {
    await prisma.situacaoAluno.deleteMany({ where: { nome: { contains: "situacoes-test" } } });
    await prisma.$disconnect();
  });

  it("creates and retrieves a situacao", async () => {
    const created = await situacaoAlunoService.create({ nome: "Custom situacoes-test" });
    const found = await situacaoAlunoService.getById(created.id);
    expect(found.nome).toBe("Custom situacoes-test");
    expect(found.ativo).toBe(true);
  });

  it("throws SituacaoAlunoNotFoundError for missing id", async () => {
    await expect(
      situacaoAlunoService.getById("00000000-0000-0000-0000-000000000000")
    ).rejects.toThrow(SituacaoAlunoNotFoundError);
  });

  it("lists only active situacoes after soft delete", async () => {
    const a = await situacaoAlunoService.create({ nome: "A situacoes-test" });
    await situacaoAlunoService.create({ nome: "B situacoes-test" });
    await situacaoAlunoService.remove(a.id);

    const { items } = await situacaoAlunoService.list(1, 50);
    const nomes = items.map((s) => s.nome).filter((n) => n.includes("situacoes-test"));
    expect(nomes).toEqual(["B situacoes-test"]);
  });

  it("rejects creating a situacao with an empty nome", async () => {
    await expect(situacaoAlunoService.create({ nome: "" })).rejects.toThrow();
  });

  it("rejects creating a situacao with a duplicate nome", async () => {
    await situacaoAlunoService.create({ nome: "Dup situacoes-test" });
    await expect(situacaoAlunoService.create({ nome: "Dup situacoes-test" })).rejects.toThrow();
  });

  it("finds the seeded Ativo situacao by nome", async () => {
    const ativo = await situacaoAlunoService.findByNome("Ativo");
    expect(ativo?.nome).toBe("Ativo");
  });
});
