import { professorRepository } from "./professores.repository.js";
import type { CreateProfessorInput, UpdateProfessorInput } from "./professores.types.js";

export class ProfessorNotFoundError extends Error {}
export class ProfessorValidationError extends Error {}

function assertValid(data: { nome?: string; escolaId?: string }) {
  if (data.nome !== undefined && data.nome.trim().length === 0) {
    throw new ProfessorValidationError("nome não pode ser vazio");
  }
  if (data.escolaId !== undefined && data.escolaId.trim().length === 0) {
    throw new ProfessorValidationError("escola é obrigatória");
  }
}

export const professorService = {
  list(page: number, pageSize: number) {
    return professorRepository.list(page, pageSize);
  },

  async getById(id: string) {
    const professor = await professorRepository.findById(id);
    if (!professor) {
      throw new ProfessorNotFoundError(id);
    }
    return professor;
  },

  async create(data: CreateProfessorInput) {
    assertValid(data);
    return professorRepository.create(data);
  },

  async update(id: string, data: UpdateProfessorInput) {
    assertValid(data);
    await this.getById(id);
    return professorRepository.update(id, data);
  },

  async remove(id: string) {
    await this.getById(id);
    return professorRepository.softDelete(id);
  }
};
