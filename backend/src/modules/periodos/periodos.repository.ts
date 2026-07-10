import { prisma } from "../../core/prisma.js";
import type { CreatePeriodoInput, UpdatePeriodoInput } from "./periodos.types.js";

export const periodoRepository = {
  async list(page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      prisma.periodo.findMany({
        where: { ativo: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { nome: "asc" }
      }),
      prisma.periodo.count({ where: { ativo: true } })
    ]);
    return { items, total };
  },

  findById(id: string) {
    return prisma.periodo.findUnique({ where: { id } });
  },

  create(data: CreatePeriodoInput) {
    return prisma.periodo.create({ data });
  },

  update(id: string, data: UpdatePeriodoInput) {
    return prisma.periodo.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.periodo.update({ where: { id }, data: { ativo: false } });
  }
};
