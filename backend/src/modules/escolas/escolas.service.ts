import { escolaRepository } from "./escolas.repository.js";
import type { CreateEscolaInput, UpdateEscolaInput } from "./escolas.types.js";

export class EscolaNotFoundError extends Error {}
export class EscolaValidationError extends Error {}

function assertValidNome(nome: string | undefined) {
  if (nome !== undefined && nome.trim().length === 0) {
    throw new EscolaValidationError("nome não pode ser vazio");
  }
}

export const escolaService = {
  listOptions() {
    return escolaRepository.listOptions();
  },

  list(page: number, pageSize: number) {
    return escolaRepository.list(page, pageSize);
  },

  async getById(id: string) {
    const escola = await escolaRepository.findById(id);
    if (!escola) {
      throw new EscolaNotFoundError(id);
    }
    return escola;
  },

  async create(data: CreateEscolaInput) {
    assertValidNome(data.nome);
    return escolaRepository.create(data);
  },

  async update(id: string, data: UpdateEscolaInput) {
    assertValidNome(data.nome);
    await this.getById(id);
    return escolaRepository.update(id, data);
  },

  async remove(id: string) {
    await this.getById(id);
    return escolaRepository.softDelete(id);
  }
};
