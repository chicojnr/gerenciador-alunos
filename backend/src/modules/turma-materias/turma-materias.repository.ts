import { prisma } from "../../core/prisma.js";
import type { CreateTurmaMateriaInput } from "./turma-materias.types.js";

const INCLUDE = {
  materia: { select: { id: true, nome: true } },
  professor: { select: { id: true, nome: true } }
} as const;

export const turmaMateriaRepository = {
  listByTurma(turmaId: string) {
    return prisma.turmaMateria.findMany({
      where: { turmaId },
      include: INCLUDE,
      orderBy: { createdAt: "asc" }
    });
  },

  findById(id: string) {
    return prisma.turmaMateria.findUnique({ where: { id } });
  },

  create(turmaId: string, data: CreateTurmaMateriaInput) {
    return prisma.turmaMateria.create({
      data: { turmaId, materiaId: data.materiaId, professorId: data.professorId },
      include: INCLUDE
    });
  },

  remove(id: string) {
    return prisma.turmaMateria.delete({ where: { id } });
  }
};
