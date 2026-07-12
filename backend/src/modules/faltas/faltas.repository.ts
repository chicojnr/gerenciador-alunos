import { prisma } from "../../core/prisma.js";

export const faltaRepository = {
  listByTurmaAndData(turmaId: string, data: Date) {
    return prisma.falta.findMany({
      where: { data, aluno: { turmaId } },
      select: { alunoId: true }
    });
  },

  replaceDia(turmaId: string, data: Date, alunoIds: string[]) {
    return prisma.$transaction([
      prisma.falta.deleteMany({ where: { data, aluno: { turmaId } } }),
      prisma.falta.createMany({ data: alunoIds.map((alunoId) => ({ alunoId, data })) })
    ]);
  },

  listSince(desde: Date) {
    return prisma.falta.findMany({
      where: {
        data: { gte: desde },
        aluno: { ativo: true }
      },
      include: {
        aluno: { select: { id: true, nome: true, turma: { select: { id: true, nome: true } } } }
      },
      orderBy: { data: "desc" }
    });
  }
};
