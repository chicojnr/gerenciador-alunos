import { Prisma } from "@prisma/client";
import { prisma } from "../../core/prisma.js";
import { responsavelComunicacaoRepository } from "./responsaveis-comunicacao.repository.js";
import type {
  CreateResponsavelComunicacaoInput,
  UpdateResponsavelComunicacaoInput
} from "./responsaveis-comunicacao.types.js";

export class ResponsavelComunicacaoNotFoundError extends Error {}
export class ResponsavelComunicacaoValidationError extends Error {}
export class ResponsavelComunicacaoDuplicateError extends Error {}

function assertValid(data: { userId?: string; escolaId?: string }) {
  if (data.userId !== undefined && data.userId.trim().length === 0) {
    throw new ResponsavelComunicacaoValidationError("usuário é obrigatório");
  }
  if (data.escolaId !== undefined && data.escolaId.trim().length === 0) {
    throw new ResponsavelComunicacaoValidationError("escola é obrigatória");
  }
}

async function assertUserExists(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { ativo: true } });
  if (!user || !user.ativo) {
    throw new ResponsavelComunicacaoValidationError(
      "o responsável por comunicação deve ser um usuário cadastrado e ativo"
    );
  }
}

export const responsavelComunicacaoService = {
  list(page: number, pageSize: number) {
    return responsavelComunicacaoRepository.list(page, pageSize);
  },

  async getById(id: string) {
    const item = await responsavelComunicacaoRepository.findById(id);
    if (!item) {
      throw new ResponsavelComunicacaoNotFoundError(id);
    }
    return item;
  },

  async create(data: CreateResponsavelComunicacaoInput) {
    assertValid(data);
    if (!data.userId || !data.escolaId) {
      throw new ResponsavelComunicacaoValidationError("usuário e escola são obrigatórios");
    }
    await assertUserExists(data.userId);
    try {
      return await responsavelComunicacaoRepository.create(data);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new ResponsavelComunicacaoDuplicateError(
          "este usuário já é responsável por comunicação nesta escola"
        );
      }
      throw err;
    }
  },

  async update(id: string, data: UpdateResponsavelComunicacaoInput) {
    assertValid(data);
    await this.getById(id);
    if (data.userId !== undefined) {
      await assertUserExists(data.userId);
    }
    try {
      return await responsavelComunicacaoRepository.update(id, data);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new ResponsavelComunicacaoDuplicateError(
          "este usuário já é responsável por comunicação nesta escola"
        );
      }
      throw err;
    }
  },

  async remove(id: string) {
    await this.getById(id);
    return responsavelComunicacaoRepository.softDelete(id);
  }
};
