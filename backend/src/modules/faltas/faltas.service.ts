import { prisma } from "../../core/prisma.js";
import { faltaRepository, FaltaConcorrenciaError } from "./faltas.repository.js";
import type { RegistrarFaltasInput } from "./faltas.types.js";

export { FaltaConcorrenciaError };
export class FaltaValidationError extends Error {}

function parseData(iso: string): Date {
  if (typeof iso !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    throw new FaltaValidationError("data deve estar no formato AAAA-MM-DD");
  }
  const [ano, mes, dia] = iso.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  if (data.getUTCFullYear() !== ano || data.getUTCMonth() !== mes - 1 || data.getUTCDate() !== dia) {
    throw new FaltaValidationError("data inválida");
  }
  return data;
}

export const faltaService = {
  async listByTurmaAndData(turmaId: string, dataISO: string) {
    if (!turmaId) {
      throw new FaltaValidationError("turma é obrigatória");
    }
    const data = parseData(dataISO);
    const faltas = await faltaRepository.listByTurmaAndData(turmaId, data);
    return { alunoIds: faltas.map((f) => f.alunoId) };
  },

  async registrarDia({ turmaId, data: dataISO, alunoIds }: RegistrarFaltasInput) {
    if (!turmaId) {
      throw new FaltaValidationError("turma é obrigatória");
    }
    if (!Array.isArray(alunoIds)) {
      throw new FaltaValidationError("alunoIds deve ser uma lista");
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
