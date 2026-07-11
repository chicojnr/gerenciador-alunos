import { Prisma } from "@prisma/client";
import { turmaMateriaRepository } from "./turma-materias.repository.js";
import type { CreateTurmaMateriaInput } from "./turma-materias.types.js";

export class TurmaMateriaNotFoundError extends Error {}
export class TurmaMateriaValidationError extends Error {}
export class TurmaMateriaDuplicateError extends Error {}

export const turmaMateriaService = {
  listByTurma(turmaId: string) {
    return turmaMateriaRepository.listByTurma(turmaId);
  },

  async create(turmaId: string, data: CreateTurmaMateriaInput) {
    if (!data.materiaId || !data.professorId) {
      throw new TurmaMateriaValidationError("matéria e professor são obrigatórios");
    }
    try {
      return await turmaMateriaRepository.create(turmaId, data);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new TurmaMateriaDuplicateError("esta matéria já está atribuída nesta turma");
      }
      throw err;
    }
  },

  async remove(id: string) {
    const existing = await turmaMateriaRepository.findById(id);
    if (!existing) {
      throw new TurmaMateriaNotFoundError(id);
    }
    return turmaMateriaRepository.remove(id);
  }
};
