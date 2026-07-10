import { prisma } from "../../core/prisma.js";
import type { CreateMateriaInput, UpdateMateriaInput } from "./materias.types.js";

export const materiaRepository = {
  async list(page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      prisma.materia.findMany({
        where: { ativo: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { nome: "asc" }
      }),
      prisma.materia.count({ where: { ativo: true } })
    ]);
    return { items, total };
  },

  findById(id: string) {
    return prisma.materia.findUnique({ where: { id } });
  },

  create(data: CreateMateriaInput) {
    return prisma.materia.create({ data });
  },

  update(id: string, data: UpdateMateriaInput) {
    return prisma.materia.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.materia.update({ where: { id }, data: { ativo: false } });
  }
};
