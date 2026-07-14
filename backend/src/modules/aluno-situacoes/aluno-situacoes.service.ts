import { alunoSituacaoRepository } from "./aluno-situacoes.repository.js";
import { alunoService } from "../alunos/alunos.service.js";
import { situacaoAlunoService } from "../situacoes-aluno/situacoes-aluno.service.js";
import type { CreateAlunoSituacaoInput } from "./aluno-situacoes.types.js";

export class AlunoSituacaoValidationError extends Error {}
export class SituacaoInativaError extends Error {}

export const alunoSituacaoService = {
  async listByAluno(alunoId: string) {
    await alunoService.getById(alunoId);
    return alunoSituacaoRepository.listByAluno(alunoId);
  },

  async changeSituacao(alunoId: string, data: CreateAlunoSituacaoInput) {
    if (!data.situacaoId) {
      throw new AlunoSituacaoValidationError("situação é obrigatória");
    }
    if (!data.dataMudanca) {
      throw new AlunoSituacaoValidationError("data da mudança é obrigatória");
    }

    await alunoService.getById(alunoId);
    const situacao = await situacaoAlunoService.getById(data.situacaoId);
    if (!situacao.ativo) {
      throw new SituacaoInativaError("situação selecionada está inativa");
    }

    return alunoSituacaoRepository.changeSituacao(
      alunoId,
      data.situacaoId,
      new Date(data.dataMudanca),
      data.observacao
    );
  }
};
