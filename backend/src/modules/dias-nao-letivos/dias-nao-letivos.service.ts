import { Prisma } from "@prisma/client";
import { diaNaoLetivoRepository } from "./dias-nao-letivos.repository.js";
import type { CreateDiaNaoLetivoInput } from "./dias-nao-letivos.types.js";

export class DiaNaoLetivoNotFoundError extends Error {}
export class DiaNaoLetivoValidationError extends Error {}
export class DiaNaoLetivoDuplicateError extends Error {}

const TIPOS_VALIDOS = new Set(["FERIADO", "PONTE", "FERIAS"]);

function parseData(iso: string): Date {
  if (typeof iso !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    throw new DiaNaoLetivoValidationError("data deve estar no formato AAAA-MM-DD");
  }
  const [ano, mes, dia] = iso.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  if (data.getUTCFullYear() !== ano || data.getUTCMonth() !== mes - 1 || data.getUTCDate() !== dia) {
    throw new DiaNaoLetivoValidationError("data inválida");
  }
  return data;
}

export const diaNaoLetivoService = {
  listByEscola(escolaId: string) {
    return diaNaoLetivoRepository.listByEscola(escolaId);
  },

  async create(escolaId: string, input: CreateDiaNaoLetivoInput) {
    if (!escolaId) {
      throw new DiaNaoLetivoValidationError("escola é obrigatória");
    }
    if (!input.tipo || !TIPOS_VALIDOS.has(input.tipo)) {
      throw new DiaNaoLetivoValidationError("tipo deve ser FERIADO, PONTE ou FERIAS");
    }
    const data = parseData(input.data);
    try {
      return await diaNaoLetivoRepository.create(escolaId, {
        data,
        tipo: input.tipo,
        descricao: input.descricao
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new DiaNaoLetivoDuplicateError("já existe um dia não letivo cadastrado nesta data");
      }
      throw err;
    }
  },

  async remove(id: string) {
    const existing = await diaNaoLetivoRepository.findById(id);
    if (!existing) {
      throw new DiaNaoLetivoNotFoundError(id);
    }
    return diaNaoLetivoRepository.remove(id);
  }
};
