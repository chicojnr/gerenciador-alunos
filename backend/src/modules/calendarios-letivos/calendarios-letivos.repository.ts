import { prisma } from "../../core/prisma.js";
import type {
  CreateCalendarioLetivoInput,
  UpdateCalendarioLetivoInput
} from "./calendarios-letivos.types.js";

const INCLUDE = { escola: { select: { id: true, nome: true } } } as const;

function toCreateData(data: CreateCalendarioLetivoInput) {
  return {
    ...data,
    dataInicio: new Date(data.dataInicio),
    dataFim: new Date(data.dataFim)
  };
}

function toUpdateData(data: UpdateCalendarioLetivoInput) {
  return {
    ...data,
    dataInicio: data.dataInicio ? new Date(data.dataInicio) : undefined,
    dataFim: data.dataFim ? new Date(data.dataFim) : undefined
  };
}

export const calendarioLetivoRepository = {
  async list(page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      prisma.calendarioLetivo.findMany({
        where: { ativo: true },
        include: INCLUDE,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { dataInicio: "desc" }
      }),
      prisma.calendarioLetivo.count({ where: { ativo: true } })
    ]);
    return { items, total };
  },

  findById(id: string) {
    return prisma.calendarioLetivo.findUnique({ where: { id }, include: INCLUDE });
  },

  create(data: CreateCalendarioLetivoInput) {
    return prisma.calendarioLetivo.create({ data: toCreateData(data), include: INCLUDE });
  },

  update(id: string, data: UpdateCalendarioLetivoInput) {
    return prisma.calendarioLetivo.update({
      where: { id },
      data: toUpdateData(data),
      include: INCLUDE
    });
  },

  softDelete(id: string) {
    return prisma.calendarioLetivo.update({ where: { id }, data: { ativo: false } });
  }
};
