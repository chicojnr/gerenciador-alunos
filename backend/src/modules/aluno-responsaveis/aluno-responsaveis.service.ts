import { Prisma } from "@prisma/client";
import { alunoResponsavelRepository } from "./aluno-responsaveis.repository.js";
import type { CreateAlunoResponsavelInput } from "./aluno-responsaveis.types.js";

export class AlunoResponsavelNotFoundError extends Error {}
export class AlunoResponsavelValidationError extends Error {}
export class AlunoResponsavelDuplicateError extends Error {}

export const alunoResponsavelService = {
  listByAluno(alunoId: string) {
    return alunoResponsavelRepository.listByAluno(alunoId);
  },

  async create(alunoId: string, data: CreateAlunoResponsavelInput) {
    if (!data.responsavelId) {
      throw new AlunoResponsavelValidationError("responsável é obrigatório");
    }
    try {
      return await alunoResponsavelRepository.create(alunoId, data);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new AlunoResponsavelDuplicateError("este responsável já está vinculado a este aluno");
      }
      throw err;
    }
  },

  async remove(id: string) {
    const existing = await alunoResponsavelRepository.findById(id);
    if (!existing) {
      throw new AlunoResponsavelNotFoundError(id);
    }
    return alunoResponsavelRepository.remove(id);
  }
};
