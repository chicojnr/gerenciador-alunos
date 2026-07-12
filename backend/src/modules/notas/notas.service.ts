import { notaRepository } from "./notas.repository.js";
import type { LancarNotasInput } from "./notas.types.js";

export class NotaValidationError extends Error {}

export const notaService = {
  async listByTurmaMateriaBimestre(turmaId: string, materiaId: string, bimestre: number) {
    if (!turmaId || !materiaId) {
      throw new NotaValidationError("turma e matéria são obrigatórias");
    }
    if (!Number.isInteger(bimestre) || bimestre < 1 || bimestre > 4) {
      throw new NotaValidationError("bimestre deve ser um número entre 1 e 4");
    }
    const notas = await notaRepository.listByTurmaMateriaBimestre(turmaId, materiaId, bimestre);
    return { notas };
  },

  async lancar({ materiaId, bimestre, notas }: LancarNotasInput) {
    if (!materiaId) {
      throw new NotaValidationError("matéria é obrigatória");
    }
    if (!Number.isInteger(bimestre) || bimestre < 1 || bimestre > 4) {
      throw new NotaValidationError("bimestre deve ser um número entre 1 e 4");
    }
    for (const { valor } of notas) {
      if (typeof valor !== "number" || Number.isNaN(valor) || valor < 0 || valor > 10) {
        throw new NotaValidationError("nota deve ser um número entre 0 e 10");
      }
    }

    await notaRepository.upsertMany(materiaId, bimestre, notas);
    return { lancadas: notas.length };
  }
};
