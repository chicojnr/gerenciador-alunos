import { prisma } from "../../core/prisma.js";
import type { NotaLancamento } from "./notas.types.js";

export const notaRepository = {
  listByTurmaMateriaBimestre(turmaId: string, materiaId: string, bimestre: number) {
    return prisma.nota.findMany({
      where: { materiaId, bimestre, aluno: { turmaId } },
      select: { alunoId: true, valor: true }
    });
  },

  upsertMany(materiaId: string, bimestre: number, notas: NotaLancamento[]) {
    return prisma.$transaction(
      notas.map(({ alunoId, valor }) =>
        prisma.nota.upsert({
          where: { alunoId_materiaId_bimestre: { alunoId, materiaId, bimestre } },
          update: { valor },
          create: { alunoId, materiaId, bimestre, valor }
        })
      )
    );
  },

  mediaPorMateria() {
    return prisma.nota.groupBy({
      by: ["materiaId"],
      _avg: { valor: true }
    });
  }
};
