import { turmaRepository } from "./turmas.repository.js";
import type { CreateTurmaInput, UpdateTurmaInput } from "./turmas.types.js";

export class TurmaNotFoundError extends Error {}
export class TurmaValidationError extends Error {}

function assertValid(data: { nome?: string; serie?: string; escolaId?: string; periodoId?: string }) {
  if (data.nome !== undefined && data.nome.trim().length === 0) {
    throw new TurmaValidationError("nome não pode ser vazio");
  }
  if (data.serie !== undefined && data.serie.trim().length === 0) {
    throw new TurmaValidationError("série não pode ser vazia");
  }
  if (data.escolaId !== undefined && data.escolaId.trim().length === 0) {
    throw new TurmaValidationError("escola é obrigatória");
  }
  if (data.periodoId !== undefined && data.periodoId.trim().length === 0) {
    throw new TurmaValidationError("período é obrigatório");
  }
}

export const turmaService = {
  list(page: number, pageSize: number) {
    return turmaRepository.list(page, pageSize);
  },

  async getById(id: string) {
    const turma = await turmaRepository.findById(id);
    if (!turma) {
      throw new TurmaNotFoundError(id);
    }
    return turma;
  },

  async create(data: CreateTurmaInput) {
    assertValid(data);
    return turmaRepository.create(data);
  },

  async update(id: string, data: UpdateTurmaInput) {
    assertValid(data);
    await this.getById(id);
    return turmaRepository.update(id, data);
  },

  async remove(id: string) {
    await this.getById(id);
    return turmaRepository.softDelete(id);
  }
};
