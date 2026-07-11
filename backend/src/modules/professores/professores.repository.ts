import { prisma } from "../../core/prisma.js";
import type { CreateProfessorInput, UpdateProfessorInput } from "./professores.types.js";

export const professorRepository = {
  async list(page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      prisma.professor.findMany({
        where: { ativo: true },
        include: { escola: { select: { id: true, nome: true } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { nome: "asc" }
      }),
      prisma.professor.count({ where: { ativo: true } })
    ]);
    return { items, total };
  },

  findById(id: string) {
    return prisma.professor.findUnique({
      where: { id },
      include: { escola: { select: { id: true, nome: true } } }
    });
  },

  create(data: CreateProfessorInput) {
    return prisma.professor.create({
      data,
      include: { escola: { select: { id: true, nome: true } } }
    });
  },

  update(id: string, data: UpdateProfessorInput) {
    return prisma.professor.update({
      where: { id },
      data,
      include: { escola: { select: { id: true, nome: true } } }
    });
  },

  softDelete(id: string) {
    return prisma.professor.update({ where: { id }, data: { ativo: false } });
  }
};
