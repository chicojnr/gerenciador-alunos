import { prisma } from "../../core/prisma.js";
import type { TipoDiaNaoLetivo } from "@prisma/client";

export const diaNaoLetivoRepository = {
  listByEscola(escolaId: string) {
    return prisma.diaNaoLetivo.findMany({
      where: { escolaId },
      orderBy: { data: "asc" }
    });
  },

  listByEscolas(escolaIds: string[], desde: Date) {
    return prisma.diaNaoLetivo.findMany({
      where: { escolaId: { in: escolaIds }, data: { gte: desde } }
    });
  },

  findById(id: string) {
    return prisma.diaNaoLetivo.findUnique({ where: { id } });
  },

  create(escolaId: string, data: { data: Date; tipo: TipoDiaNaoLetivo; descricao?: string }) {
    return prisma.diaNaoLetivo.create({
      data: { escolaId, data: data.data, tipo: data.tipo, descricao: data.descricao }
    });
  },

  remove(id: string) {
    return prisma.diaNaoLetivo.delete({ where: { id } });
  }
};
