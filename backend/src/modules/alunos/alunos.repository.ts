import { prisma } from "../../core/prisma.js";
import type { CreateAlunoInput, UpdateAlunoInput } from "./alunos.types.js";

const INCLUDE = {
  turma: { select: { id: true, nome: true } }
} as const;

function toCreateData(data: CreateAlunoInput) {
  return {
    ...data,
    dataNascimento: data.dataNascimento ? new Date(data.dataNascimento) : undefined
  };
}

function toUpdateData(data: UpdateAlunoInput) {
  return {
    ...data,
    dataNascimento: data.dataNascimento ? new Date(data.dataNascimento) : undefined
  };
}

export const alunoRepository = {
  async list(page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      prisma.aluno.findMany({
        where: { ativo: true },
        include: INCLUDE,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { nome: "asc" }
      }),
      prisma.aluno.count({ where: { ativo: true } })
    ]);
    return { items, total };
  },

  findById(id: string) {
    return prisma.aluno.findUnique({ where: { id }, include: INCLUDE });
  },

  create(data: CreateAlunoInput) {
    return prisma.aluno.create({ data: toCreateData(data), include: INCLUDE });
  },

  update(id: string, data: UpdateAlunoInput) {
    return prisma.aluno.update({ where: { id }, data: toUpdateData(data), include: INCLUDE });
  },

  softDelete(id: string) {
    return prisma.aluno.update({ where: { id }, data: { ativo: false } });
  }
};
