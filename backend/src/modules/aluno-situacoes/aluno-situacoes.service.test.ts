import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "../../core/prisma.js";
import { alunoService } from "../alunos/alunos.service.js";
import { situacaoAlunoService } from "../situacoes-aluno/situacoes-aluno.service.js";
import {
  alunoSituacaoService,
  SituacaoInativaError,
  AlunoSituacaoValidationError
} from "./aluno-situacoes.service.js";

describe("alunoSituacaoService", () => {
  let alunoId: string;
  let transferidoId: string;

  beforeEach(async () => {
    await prisma.alunoSituacaoHistorico.deleteMany();
    await prisma.situacaoAluno.deleteMany({ where: { nome: { contains: "aluno-sit-test" } } });
    await prisma.aluno.deleteMany({ where: { nome: { contains: "aluno-sit-test" } } });
    await prisma.turma.deleteMany({ where: { nome: { contains: "aluno-sit-test" } } });
    await prisma.escola.deleteMany({ where: { nome: { contains: "aluno-sit-test" } } });
    await prisma.periodo.deleteMany({ where: { nome: { contains: "aluno-sit-test" } } });

    const escola = await prisma.escola.create({ data: { nome: "Escola aluno-sit-test" } });
    const periodo = await prisma.periodo.create({ data: { nome: "Periodo aluno-sit-test" } });
    const turma = await prisma.turma.create({
      data: { nome: "Turma aluno-sit-test", serie: "6 Ano", escolaId: escola.id, periodoId: periodo.id }
    });
    const aluno = await alunoService.create({ nome: "Aluno aluno-sit-test", turmaId: turma.id });
    alunoId = aluno.id;

    const transferido = await situacaoAlunoService.findByNome("Transferido");
    transferidoId = transferido!.id;
  });

  afterAll(async () => {
    await prisma.alunoSituacaoHistorico.deleteMany();
    await prisma.situacaoAluno.deleteMany({ where: { nome: { contains: "aluno-sit-test" } } });
    await prisma.aluno.deleteMany({ where: { nome: { contains: "aluno-sit-test" } } });
    await prisma.turma.deleteMany({ where: { nome: { contains: "aluno-sit-test" } } });
    await prisma.escola.deleteMany({ where: { nome: { contains: "aluno-sit-test" } } });
    await prisma.periodo.deleteMany({ where: { nome: { contains: "aluno-sit-test" } } });
    await prisma.$disconnect();
  });

  it("changes the situacao and records history with the current situacao updated", async () => {
    await alunoSituacaoService.changeSituacao(alunoId, {
      situacaoId: transferidoId,
      dataMudanca: "2026-08-01"
    });

    const aluno = await alunoService.getById(alunoId);
    expect(aluno.situacaoAtual.nome).toBe("Transferido");

    const historico = await alunoSituacaoService.listByAluno(alunoId);
    expect(historico).toHaveLength(2);
    expect(historico[0].situacao.nome).toBe("Transferido");
  });

  it("rejects changing to an inactive situacao", async () => {
    const custom = await situacaoAlunoService.create({ nome: "Descartada aluno-sit-test" });
    await situacaoAlunoService.remove(custom.id);

    await expect(
      alunoSituacaoService.changeSituacao(alunoId, {
        situacaoId: custom.id,
        dataMudanca: "2026-08-01"
      })
    ).rejects.toThrow(SituacaoInativaError);
  });

  it("rejects an empty dataMudanca", async () => {
    await expect(
      alunoSituacaoService.changeSituacao(alunoId, { situacaoId: transferidoId, dataMudanca: "" })
    ).rejects.toThrow(AlunoSituacaoValidationError);
  });
});
