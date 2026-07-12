import { prisma } from "../../core/prisma.js";
import type { CreateTemplateInput, UpdateTemplateInput } from "./mensagens.types.js";

export const templateRepository = {
  async list(page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      prisma.mensagemTemplate.findMany({
        where: { ativo: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { nome: "asc" }
      }),
      prisma.mensagemTemplate.count({ where: { ativo: true } })
    ]);
    return { items, total };
  },

  findById(id: string) {
    return prisma.mensagemTemplate.findUnique({ where: { id } });
  },

  create(data: CreateTemplateInput) {
    return prisma.mensagemTemplate.create({ data });
  },

  update(id: string, data: UpdateTemplateInput) {
    return prisma.mensagemTemplate.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.mensagemTemplate.update({ where: { id }, data: { ativo: false } });
  }
};

export const envioRepository = {
  createMany(
    envios: {
      templateId: string;
      alunoId: string;
      responsavelId: string;
      telefone: string | null;
      mensagem: string;
    }[]
  ) {
    return prisma.envioMensagem.createMany({ data: envios });
  },

  listRecentes(limit: number) {
    return prisma.envioMensagem.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        aluno: { select: { id: true, nome: true } },
        responsavel: { select: { id: true, nome: true } },
        template: { select: { id: true, nome: true } }
      }
    });
  }
};
