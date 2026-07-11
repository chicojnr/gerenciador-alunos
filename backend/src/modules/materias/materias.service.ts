import { materiaRepository } from "./materias.repository.js";
import type { CreateMateriaInput, UpdateMateriaInput } from "./materias.types.js";

export class MateriaNotFoundError extends Error {}
export class MateriaValidationError extends Error {}

function assertValidNome(nome: string | undefined) {
  if (nome !== undefined && nome.trim().length === 0) {
    throw new MateriaValidationError("nome não pode ser vazio");
  }
}

export const materiaService = {
  list(page: number, pageSize: number) {
    return materiaRepository.list(page, pageSize);
  },

  async getById(id: string) {
    const materia = await materiaRepository.findById(id);
    if (!materia) {
      throw new MateriaNotFoundError(id);
    }
    return materia;
  },

  async create(data: CreateMateriaInput) {
    assertValidNome(data.nome);
    return materiaRepository.create(data);
  },

  async update(id: string, data: UpdateMateriaInput) {
    assertValidNome(data.nome);
    await this.getById(id);
    return materiaRepository.update(id, data);
  },

  async remove(id: string) {
    await this.getById(id);
    return materiaRepository.softDelete(id);
  }
};
