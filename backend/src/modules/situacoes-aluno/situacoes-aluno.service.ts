import { situacaoAlunoRepository } from "./situacoes-aluno.repository.js";
import type { CreateSituacaoAlunoInput, UpdateSituacaoAlunoInput } from "./situacoes-aluno.types.js";

export class SituacaoAlunoNotFoundError extends Error {}
export class SituacaoAlunoValidationError extends Error {}

function assertValidNome(nome: string | undefined) {
  if (nome !== undefined && nome.trim().length === 0) {
    throw new SituacaoAlunoValidationError("nome não pode ser vazio");
  }
}

export const situacaoAlunoService = {
  list(page: number, pageSize: number) {
    return situacaoAlunoRepository.list(page, pageSize);
  },

  async getById(id: string) {
    const situacao = await situacaoAlunoRepository.findById(id);
    if (!situacao) {
      throw new SituacaoAlunoNotFoundError(id);
    }
    return situacao;
  },

  findByNome(nome: string) {
    return situacaoAlunoRepository.findByNome(nome);
  },

  async create(data: CreateSituacaoAlunoInput) {
    assertValidNome(data.nome);
    return situacaoAlunoRepository.create(data);
  },

  async update(id: string, data: UpdateSituacaoAlunoInput) {
    assertValidNome(data.nome);
    await this.getById(id);
    return situacaoAlunoRepository.update(id, data);
  },

  async remove(id: string) {
    await this.getById(id);
    return situacaoAlunoRepository.softDelete(id);
  }
};
