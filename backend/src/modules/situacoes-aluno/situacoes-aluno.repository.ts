import { prisma } from "../../core/prisma.js";
import type { CreateSituacaoAlunoInput, UpdateSituacaoAlunoInput } from "./situacoes-aluno.types.js";

export const situacaoAlunoRepository = {
  async list(page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      prisma.situacaoAluno.findMany({
        where: { ativo: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { nome: "asc" }
      }),
      prisma.situacaoAluno.count({ where: { ativo: true } })
    ]);
    return { items, total };
  },

  findById(id: string) {
    return prisma.situacaoAluno.findUnique({ where: { id } });
  },

  findByNome(nome: string) {
    return prisma.situacaoAluno.findUnique({ where: { nome } });
  },

  create(data: CreateSituacaoAlunoInput) {
    return prisma.situacaoAluno.create({ data });
  },

  update(id: string, data: UpdateSituacaoAlunoInput) {
    return prisma.situacaoAluno.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.situacaoAluno.update({ where: { id }, data: { ativo: false } });
  }
};
