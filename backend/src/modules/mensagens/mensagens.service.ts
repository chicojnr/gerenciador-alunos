import { prisma } from "../../core/prisma.js";
import { templateRepository, envioRepository } from "./mensagens.repository.js";
import type {
  CreateTemplateInput,
  UpdateTemplateInput,
  EnviarMensagensInput
} from "./mensagens.types.js";

export class TemplateNotFoundError extends Error {}
export class MensagemValidationError extends Error {}

function assertValidTemplate(data: CreateTemplateInput | UpdateTemplateInput) {
  if (data.nome !== undefined && data.nome.trim().length === 0) {
    throw new MensagemValidationError("nome não pode ser vazio");
  }
  if (data.conteudo !== undefined && data.conteudo.trim().length === 0) {
    throw new MensagemValidationError("conteúdo não pode ser vazio");
  }
}

function renderMensagem(conteudo: string, alunoNome: string, responsavelNome: string): string {
  return conteudo.replaceAll("{aluno}", alunoNome).replaceAll("{responsavel}", responsavelNome);
}

export const templateService = {
  list(page: number, pageSize: number) {
    return templateRepository.list(page, pageSize);
  },

  async getById(id: string) {
    const template = await templateRepository.findById(id);
    if (!template) {
      throw new TemplateNotFoundError(id);
    }
    return template;
  },

  async create(data: CreateTemplateInput) {
    assertValidTemplate(data);
    return templateRepository.create(data);
  },

  async update(id: string, data: UpdateTemplateInput) {
    assertValidTemplate(data);
    await this.getById(id);
    return templateRepository.update(id, data);
  },

  async remove(id: string) {
    await this.getById(id);
    return templateRepository.softDelete(id);
  }
};

export const envioService = {
  listRecentes(limit = 50) {
    return envioRepository.listRecentes(limit);
  },

  // Registra um envio por (aluno, responsável vinculado). A entrega real via
  // provedor WhatsApp é uma integração à parte — cada registro nasce com
  // status REGISTRADO e carrega a mensagem já renderizada e o telefone.
  async enviar({ templateId, alunoIds }: EnviarMensagensInput) {
    if (!alunoIds || alunoIds.length === 0) {
      throw new MensagemValidationError("selecione ao menos um aluno");
    }
    const template = await templateRepository.findById(templateId);
    if (!template) {
      throw new TemplateNotFoundError(templateId);
    }

    const alunos = await prisma.aluno.findMany({
      where: { id: { in: alunoIds } },
      include: {
        responsaveis: {
          include: {
            responsavel: { select: { id: true, nome: true, telefone: true, ativo: true } }
          }
        }
      }
    });

    const envios = [];
    const semResponsavel: { id: string; nome: string }[] = [];
    for (const aluno of alunos) {
      const responsaveisAtivos = aluno.responsaveis.filter((r) => r.responsavel.ativo);
      if (responsaveisAtivos.length === 0) {
        semResponsavel.push({ id: aluno.id, nome: aluno.nome });
        continue;
      }
      for (const { responsavel } of responsaveisAtivos) {
        envios.push({
          templateId,
          alunoId: aluno.id,
          responsavelId: responsavel.id,
          telefone: responsavel.telefone,
          mensagem: renderMensagem(template.conteudo, aluno.nome, responsavel.nome)
        });
      }
    }

    if (envios.length > 0) {
      await envioRepository.createMany(envios);
    }

    return { registrados: envios.length, semResponsavel };
  }
};
