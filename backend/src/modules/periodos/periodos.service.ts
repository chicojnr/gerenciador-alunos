import { periodoRepository } from "./periodos.repository.js";
import type { CreatePeriodoInput, UpdatePeriodoInput } from "./periodos.types.js";

export class PeriodoNotFoundError extends Error {}
export class PeriodoValidationError extends Error {}

function assertValidNome(nome: string | undefined) {
  if (nome !== undefined && nome.trim().length === 0) {
    throw new PeriodoValidationError("nome must not be empty");
  }
}

export const periodoService = {
  list(page: number, pageSize: number) {
    return periodoRepository.list(page, pageSize);
  },

  async getById(id: string) {
    const periodo = await periodoRepository.findById(id);
    if (!periodo) {
      throw new PeriodoNotFoundError(id);
    }
    return periodo;
  },

  async create(data: CreatePeriodoInput) {
    assertValidNome(data.nome);
    return periodoRepository.create(data);
  },

  async update(id: string, data: UpdatePeriodoInput) {
    assertValidNome(data.nome);
    await this.getById(id);
    return periodoRepository.update(id, data);
  },

  async remove(id: string) {
    await this.getById(id);
    return periodoRepository.softDelete(id);
  }
};
