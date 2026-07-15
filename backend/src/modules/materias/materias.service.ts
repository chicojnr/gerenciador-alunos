import { Prisma } from "@prisma/client";
import { materiaRepository } from "./materias.repository.js";
import type { CreateMateriaInput, UpdateMateriaInput } from "./materias.types.js";

export class MateriaNotFoundError extends Error {}
export class MateriaValidationError extends Error {}

function assertValidNome(nome: string | undefined) {
  if (nome !== undefined && nome.trim().length === 0) {
    throw new MateriaValidationError("nome não pode ser vazio");
  }
}

function assertValidCodigo(codigo: string | undefined) {
  if (codigo !== undefined && codigo.trim().length === 0) {
    throw new MateriaValidationError("código não pode ser vazio");
  }
}

export const materiaService = {
  list(page: number, pageSize: number) {
    return materiaRepository.list(page, pageSize);
  },

  async getById(id: string) {
    const materia = await materiaRepository.findById(id);
    if (!materia) {
      throw new MateriaNotFoundError(id);
    }
    return materia;
  },

  async create(data: CreateMateriaInput) {
    assertValidNome(data.nome);
    if (!data.codigo || data.codigo.trim().length === 0) {
      throw new MateriaValidationError("código é obrigatório");
    }
    const existing = await materiaRepository.findByCodigo(data.codigo);
    if (existing) {
      if (existing.ativo) {
        throw new MateriaValidationError("já existe uma disciplina com este código");
      }
      return materiaRepository.reactivate(existing.id, data);
    }
    try {
      return await materiaRepository.create(data);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new MateriaValidationError("já existe uma disciplina com este código");
      }
      throw err;
    }
  },

  async update(id: string, data: UpdateMateriaInput) {
    assertValidNome(data.nome);
    assertValidCodigo(data.codigo);
    await this.getById(id);
    try {
      return await materiaRepository.update(id, data);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new MateriaValidationError("já existe uma disciplina com este código");
      }
      throw err;
    }
  },

  async remove(id: string) {
    await this.getById(id);
    return materiaRepository.softDelete(id);
  }
};
