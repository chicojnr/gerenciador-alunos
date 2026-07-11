import { alunoRepository } from "./alunos.repository.js";
import type { CreateAlunoInput, UpdateAlunoInput } from "./alunos.types.js";

export class AlunoNotFoundError extends Error {}
export class AlunoValidationError extends Error {}

function assertValid(data: { nome?: string; turmaId?: string }) {
  if (data.nome !== undefined && data.nome.trim().length === 0) {
    throw new AlunoValidationError("nome não pode ser vazio");
  }
  if (data.turmaId !== undefined && data.turmaId.trim().length === 0) {
    throw new AlunoValidationError("turma é obrigatória");
  }
}

export const alunoService = {
  list(page: number, pageSize: number) {
    return alunoRepository.list(page, pageSize);
  },

  async getById(id: string) {
    const aluno = await alunoRepository.findById(id);
    if (!aluno) {
      throw new AlunoNotFoundError(id);
    }
    return aluno;
  },

  async create(data: CreateAlunoInput) {
    assertValid(data);
    return alunoRepository.create(data);
  },

  async update(id: string, data: UpdateAlunoInput) {
    assertValid(data);
    await this.getById(id);
    return alunoRepository.update(id, data);
  },

  async remove(id: string) {
    await this.getById(id);
    return alunoRepository.softDelete(id);
  }
};
