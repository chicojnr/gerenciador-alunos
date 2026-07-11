import { responsavelRepository } from "./responsaveis.repository.js";
import type { CreateResponsavelInput, UpdateResponsavelInput } from "./responsaveis.types.js";

export class ResponsavelNotFoundError extends Error {}
export class ResponsavelValidationError extends Error {}

function assertValidNome(nome: string | undefined) {
  if (nome !== undefined && nome.trim().length === 0) {
    throw new ResponsavelValidationError("nome não pode ser vazio");
  }
}

export const responsavelService = {
  list(page: number, pageSize: number) {
    return responsavelRepository.list(page, pageSize);
  },

  async getById(id: string) {
    const responsavel = await responsavelRepository.findById(id);
    if (!responsavel) {
      throw new ResponsavelNotFoundError(id);
    }
    return responsavel;
  },

  async create(data: CreateResponsavelInput) {
    assertValidNome(data.nome);
    return responsavelRepository.create(data);
  },

  async update(id: string, data: UpdateResponsavelInput) {
    assertValidNome(data.nome);
    await this.getById(id);
    return responsavelRepository.update(id, data);
  },

  async remove(id: string) {
    await this.getById(id);
    return responsavelRepository.softDelete(id);
  }
};
