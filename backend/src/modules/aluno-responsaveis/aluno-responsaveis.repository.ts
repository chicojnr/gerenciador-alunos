import { prisma } from "../../core/prisma.js";
import type { CreateAlunoResponsavelInput } from "./aluno-responsaveis.types.js";

const INCLUDE = {
  responsavel: { select: { id: true, nome: true, telefone: true, email: true } }
} as const;

export const alunoResponsavelRepository = {
  listByAluno(alunoId: string) {
    return prisma.alunoResponsavel.findMany({
      where: { alunoId },
      include: INCLUDE,
      orderBy: { createdAt: "asc" }
    });
  },

  findById(id: string) {
    return prisma.alunoResponsavel.findUnique({ where: { id } });
  },

  create(alunoId: string, data: CreateAlunoResponsavelInput) {
    return prisma.alunoResponsavel.create({
      data: { alunoId, responsavelId: data.responsavelId },
      include: INCLUDE
    });
  },

  remove(id: string) {
    return prisma.alunoResponsavel.delete({ where: { id } });
  }
};
