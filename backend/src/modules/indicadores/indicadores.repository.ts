import { prisma } from "../../core/prisma.js";
import type { CreateIndicadorInput, UpdateIndicadorInput } from "./indicadores.types.js";

export const indicadorRepository = {
  async list(page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      prisma.indicadorFalta.findMany({
        where: { ativo: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { nome: "asc" }
      }),
      prisma.indicadorFalta.count({ where: { ativo: true } })
    ]);
    return { items, total };
  },

  listAtivos() {
    return prisma.indicadorFalta.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } });
  },

  findById(id: string) {
    return prisma.indicadorFalta.findUnique({ where: { id } });
  },

  create(data: CreateIndicadorInput) {
    return prisma.indicadorFalta.create({ data });
  },

  update(id: string, data: UpdateIndicadorInput) {
    return prisma.indicadorFalta.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.indicadorFalta.update({ where: { id }, data: { ativo: false } });
  }
};
