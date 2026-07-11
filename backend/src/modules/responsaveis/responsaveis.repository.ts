import { prisma } from "../../core/prisma.js";
import type { CreateResponsavelInput, UpdateResponsavelInput } from "./responsaveis.types.js";

export const responsavelRepository = {
  async list(page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      prisma.responsavel.findMany({
        where: { ativo: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { nome: "asc" }
      }),
      prisma.responsavel.count({ where: { ativo: true } })
    ]);
    return { items, total };
  },

  findById(id: string) {
    return prisma.responsavel.findUnique({ where: { id } });
  },

  create(data: CreateResponsavelInput) {
    return prisma.responsavel.create({ data });
  },

  update(id: string, data: UpdateResponsavelInput) {
    return prisma.responsavel.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.responsavel.update({ where: { id }, data: { ativo: false } });
  }
};
