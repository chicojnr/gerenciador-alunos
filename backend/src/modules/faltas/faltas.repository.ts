import { Prisma } from "@prisma/client";
import { prisma } from "../../core/prisma.js";

export class FaltaConcorrenciaError extends Error {}

export const faltaRepository = {
  listByTurmaAndData(turmaId: string, data: Date) {
    return prisma.falta.findMany({
      where: { data, aluno: { turmaId } },
      select: { alunoId: true }
    });
  },

  async replaceDia(turmaId: string, data: Date, alunoIds: string[]) {
    try {
      return await prisma.$transaction([
        prisma.falta.deleteMany({ where: { data, aluno: { turmaId } } }),
        prisma.falta.createMany({ data: alunoIds.map((alunoId) => ({ alunoId, data })) })
      ]);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new FaltaConcorrenciaError(
          "as faltas desta turma e data foram alteradas em outra requisição simultânea, tente novamente"
        );
      }
      throw err;
    }
  },

  listSince(desde: Date) {
    return prisma.falta.findMany({
      where: {
        data: { gte: desde },
        aluno: { ativo: true }
      },
      include: {
        aluno: {
          select: {
            id: true,
            nome: true,
            turma: { select: { id: true, nome: true, escolaId: true } }
          }
        }
      },
      orderBy: { data: "desc" }
    });
  }
};
