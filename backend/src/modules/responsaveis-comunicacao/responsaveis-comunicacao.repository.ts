import { prisma } from "../../core/prisma.js";
import type {
  CreateResponsavelComunicacaoInput,
  UpdateResponsavelComunicacaoInput
} from "./responsaveis-comunicacao.types.js";

const INCLUDE = { escola: { select: { id: true, nome: true } } } as const;

export const responsavelComunicacaoRepository = {
  async list(page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      prisma.responsavelComunicacao.findMany({
        where: { ativo: true },
        include: INCLUDE,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { nome: "asc" }
      }),
      prisma.responsavelComunicacao.count({ where: { ativo: true } })
    ]);
    return { items, total };
  },

  findById(id: string) {
    return prisma.responsavelComunicacao.findUnique({ where: { id }, include: INCLUDE });
  },

  create(data: CreateResponsavelComunicacaoInput) {
    return prisma.responsavelComunicacao.create({ data, include: INCLUDE });
  },

  update(id: string, data: UpdateResponsavelComunicacaoInput) {
    return prisma.responsavelComunicacao.update({ where: { id }, data, include: INCLUDE });
  },

  softDelete(id: string) {
    return prisma.responsavelComunicacao.update({ where: { id }, data: { ativo: false } });
  }
};
