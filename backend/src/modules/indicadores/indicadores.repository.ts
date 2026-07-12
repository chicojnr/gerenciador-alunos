import { prisma } from "../../core/prisma.js";
import type { CreateIndicadorInput, UpdateIndicadorInput } from "./indicadores.types.js";

const INCLUDE_ESCOLA = { escola: { select: { id: true, nome: true } } } as const;

export const indicadorRepository = {
  async list(page: number, pageSize: number, escolaId?: string) {
    const where = { ativo: true, ...(escolaId ? { escolaId } : {}) };
    const [items, total] = await Promise.all([
      prisma.indicadorFalta.findMany({
        where,
        include: INCLUDE_ESCOLA,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { nome: "asc" }
      }),
      prisma.indicadorFalta.count({ where })
    ]);
    return { items, total };
  },

  listAtivos() {
    return prisma.indicadorFalta.findMany({
      where: { ativo: true },
      include: INCLUDE_ESCOLA,
      orderBy: { nome: "asc" }
    });
  },

  findById(id: string) {
    return prisma.indicadorFalta.findUnique({ where: { id }, include: INCLUDE_ESCOLA });
  },

  create(data: CreateIndicadorInput) {
    return prisma.indicadorFalta.create({ data, include: INCLUDE_ESCOLA });
  },

  update(id: string, data: UpdateIndicadorInput) {
    return prisma.indicadorFalta.update({ where: { id }, data, include: INCLUDE_ESCOLA });
  },

  softDelete(id: string) {
    return prisma.indicadorFalta.update({ where: { id }, data: { ativo: false } });
  }
};
