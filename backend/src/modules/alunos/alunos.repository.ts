import { prisma } from "../../core/prisma.js";
import type { CreateAlunoInput, UpdateAlunoInput } from "./alunos.types.js";

const INCLUDE = {
  turma: { select: { id: true, nome: true } },
  situacaoAtual: { select: { id: true, nome: true } }
} as const;

function toUpdateData(data: UpdateAlunoInput) {
  return {
    ...data,
    dataNascimento: data.dataNascimento ? new Date(data.dataNascimento) : undefined
  };
}

export const alunoRepository = {
  async list(page: number, pageSize: number, turmaId?: string) {
    const where = { ativo: true, ...(turmaId ? { turmaId } : {}) };
    const [items, total] = await Promise.all([
      prisma.aluno.findMany({
        where,
        include: INCLUDE,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { nome: "asc" }
      }),
      prisma.aluno.count({ where })
    ]);
    return { items, total };
  },

  findById(id: string) {
    return prisma.aluno.findUnique({ where: { id }, include: INCLUDE });
  },

  create(data: CreateAlunoInput & { situacaoAtualId: string }) {
    const { situacaoAtualId, ...alunoData } = data;
    return prisma.$transaction(async (tx) => {
      const aluno = await tx.aluno.create({
        data: {
          ...alunoData,
          dataNascimento: alunoData.dataNascimento ? new Date(alunoData.dataNascimento) : undefined,
          situacaoAtualId
        },
        include: INCLUDE
      });
      await tx.alunoSituacaoHistorico.create({
        data: { alunoId: aluno.id, situacaoId: situacaoAtualId, dataMudanca: aluno.createdAt }
      });
      return aluno;
    });
  },

  update(id: string, data: UpdateAlunoInput) {
    return prisma.aluno.update({ where: { id }, data: toUpdateData(data), include: INCLUDE });
  },

  softDelete(id: string) {
    return prisma.aluno.update({ where: { id }, data: { ativo: false } });
  }
};
