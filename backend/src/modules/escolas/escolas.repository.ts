import { prisma } from "../../core/prisma.js";
import type { CreateEscolaInput, UpdateEscolaInput } from "./escolas.types.js";

export const escolaRepository = {
  async list(page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      prisma.escola.findMany({
        where: { ativo: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { nome: "asc" }
      }),
      prisma.escola.count({ where: { ativo: true } })
    ]);
    return { items, total };
  },

  findById(id: string) {
    return prisma.escola.findUnique({ where: { id } });
  },

  create(data: CreateEscolaInput) {
    return prisma.escola.create({ data });
  },

  update(id: string, data: UpdateEscolaInput) {
    return prisma.escola.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.escola.update({ where: { id }, data: { ativo: false } });
  }
};
