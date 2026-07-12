import { prisma } from "../../core/prisma.js";
import { faltaRepository } from "./faltas.repository.js";
import type { RegistrarFaltasInput } from "./faltas.types.js";

export class FaltaValidationError extends Error {}

function parseData(iso: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    throw new FaltaValidationError("data deve estar no formato AAAA-MM-DD");
  }
  return new Date(iso);
}

export const faltaService = {
  async listByTurmaAndData(turmaId: string, dataISO: string) {
    const data = parseData(dataISO);
    const faltas = await faltaRepository.listByTurmaAndData(turmaId, data);
    return { alunoIds: faltas.map((f) => f.alunoId) };
  },

  async registrarDia({ turmaId, data: dataISO, alunoIds }: RegistrarFaltasInput) {
    if (!turmaId) {
      throw new FaltaValidationError("turma é obrigatória");
    }
    const data = parseData(dataISO);

    if (alunoIds.length > 0) {
      const pertencentes = await prisma.aluno.count({
        where: { id: { in: alunoIds }, turmaId }
      });
      if (pertencentes !== new Set(alunoIds).size) {
        throw new FaltaValidationError("há alunos que não pertencem a esta turma");
      }
    }

    await faltaRepository.replaceDia(turmaId, data, [...new Set(alunoIds)]);
    return { alunoIds: [...new Set(alunoIds)] };
  }
};
