import { prisma } from "../../core/prisma.js";
import type { CreateTurmaInput, UpdateTurmaInput } from "./turmas.types.js";

const INCLUDE = {
  escola: { select: { id: true, nome: true } },
  periodo: { select: { id: true, nome: true } }
} as const;

export const turmaRepository = {
  async list(page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      prisma.turma.findMany({
        where: { ativo: true },
        include: INCLUDE,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { nome: "asc" }
      }),
      prisma.turma.count({ where: { ativo: true } })
    ]);
    return { items, total };
  },

  findById(id: string) {
    return prisma.turma.findUnique({ where: { id }, include: INCLUDE });
  },

  create(data: CreateTurmaInput) {
    return prisma.turma.create({ data, include: INCLUDE });
  },

  update(id: string, data: UpdateTurmaInput) {
    return prisma.turma.update({ where: { id }, data, include: INCLUDE });
  },

  softDelete(id: string) {
    return prisma.turma.update({ where: { id }, data: { ativo: false } });
  }
};
