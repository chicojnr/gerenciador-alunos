import { prisma } from "../../core/prisma.js";

const INCLUDE = {
  situacao: { select: { id: true, nome: true } }
} as const;

export const alunoSituacaoRepository = {
  listByAluno(alunoId: string) {
    // Ordered by createdAt, not dataMudanca: dataMudanca is a user-editable
    // effective date (can be backdated/postdated for corrections), so it
    // isn't reliable for determining which entry is current. createdAt
    // reflects the actual order changes were recorded, which always
    // matches whatever Aluno.situacaoAtualId was last set to.
    return prisma.alunoSituacaoHistorico.findMany({
      where: { alunoId },
      include: INCLUDE,
      orderBy: { createdAt: "desc" }
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
