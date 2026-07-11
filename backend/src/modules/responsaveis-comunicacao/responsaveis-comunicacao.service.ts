import { responsavelComunicacaoRepository } from "./responsaveis-comunicacao.repository.js";
import type {
  CreateResponsavelComunicacaoInput,
  UpdateResponsavelComunicacaoInput
} from "./responsaveis-comunicacao.types.js";

export class ResponsavelComunicacaoNotFoundError extends Error {}
export class ResponsavelComunicacaoValidationError extends Error {}

function assertValid(data: { nome?: string; escolaId?: string }) {
  if (data.nome !== undefined && data.nome.trim().length === 0) {
    throw new ResponsavelComunicacaoValidationError("nome não pode ser vazio");
  }
  if (data.escolaId !== undefined && data.escolaId.trim().length === 0) {
    throw new ResponsavelComunicacaoValidationError("escola é obrigatória");
  }
}

export const responsavelComunicacaoService = {
  list(page: number, pageSize: number) {
    return responsavelComunicacaoRepository.list(page, pageSize);
  },

  async getById(id: string) {
    const item = await responsavelComunicacaoRepository.findById(id);
    if (!item) {
      throw new ResponsavelComunicacaoNotFoundError(id);
    }
    return item;
  },

  async create(data: CreateResponsavelComunicacaoInput) {
    assertValid(data);
    return responsavelComunicacaoRepository.create(data);
  },

  async update(id: string, data: UpdateResponsavelComunicacaoInput) {
    assertValid(data);
    await this.getById(id);
    return responsavelComunicacaoRepository.update(id, data);
  },

  async remove(id: string) {
    await this.getById(id);
    return responsavelComunicacaoRepository.softDelete(id);
  }
};
