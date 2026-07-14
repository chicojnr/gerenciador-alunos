import { prisma } from "../../core/prisma.js";

const INCLUDE = {
  situacao: { select: { id: true, nome: true } }
} as const;

export const alunoSituacaoRepository = {
  listByAluno(alunoId: string) {
    return prisma.alunoSituacaoHistorico.findMany({
      where: { alunoId },
      include: INCLUDE,
      orderBy: { dataMudanca: "desc" }
    });
  },

  async changeSituacao(
    alunoId: string,
    situacaoId: string,
    dataMudanca: Date,
    observacao: string | undefined
  ) {
    return prisma.$transaction(async (tx) => {
      const historico = await tx.alunoSituacaoHistorico.create({
        data: { alunoId, situacaoId, dataMudanca, observacao },
        include: INCLUDE
      });
      await tx.aluno.update({ where: { id: alunoId }, data: { situacaoAtualId: situacaoId } });
      return historico;
    });
  }
};
