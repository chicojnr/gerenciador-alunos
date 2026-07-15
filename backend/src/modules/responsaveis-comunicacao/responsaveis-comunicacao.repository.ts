import { prisma } from "../../core/prisma.js";
import type {
  CreateResponsavelComunicacaoInput,
  UpdateResponsavelComunicacaoInput
} from "./responsaveis-comunicacao.types.js";

const INCLUDE = {
  escola: { select: { id: true, nome: true } },
  user: { select: { id: true, name: true, email: true } }
} as const;

export const responsavelComunicacaoRepository = {
  async list(page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      prisma.responsavelComunicacao.findMany({
        where: { ativo: true },
        include: INCLUDE,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { user: { name: "asc" } }
      }),
      prisma.responsavelComunicacao.count({ where: { ativo: true } })
    ]);
    return { items, total };
  },

  findById(id: string) {
    return prisma.responsavelComunicacao.findUnique({ where: { id }, include: INCLUDE });
  },

  findByUserAndEscola(userId: string, escolaId: string) {
    return prisma.responsavelComunicacao.findUnique({
      where: { userId_escolaId: { userId, escolaId } }
    });
  },

  create(data: CreateResponsavelComunicacaoInput) {
    return prisma.responsavelComunicacao.create({ data, include: INCLUDE });
  },

  reactivate(id: string, data: CreateResponsavelComunicacaoInput) {
    return prisma.responsavelComunicacao.update({
      where: { id },
      data: { ...data, ativo: true },
      include: INCLUDE
    });
  },

  update(id: string, data: UpdateResponsavelComunicacaoInput) {
    return prisma.responsavelComunicacao.update({ where: { id }, data, include: INCLUDE });
  },

  softDelete(id: string) {
    return prisma.responsavelComunicacao.update({ where: { id }, data: { ativo: false } });
  },

  hardDelete(id: string) {
    return prisma.responsavelComunicacao.delete({ where: { id } });
  }
};
