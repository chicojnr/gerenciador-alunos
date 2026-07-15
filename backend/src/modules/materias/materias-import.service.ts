import { materiaRepository } from "./materias.repository.js";
import { materiaService } from "./materias.service.js";
import { parseMateriasFromPdf } from "./materias-import.parser.js";
import type { ParsedMateria } from "./materias-import.parser.js";
import type { Materia } from "@prisma/client";

export interface MateriaImportPreviewItem extends ParsedMateria {
  status: "novo" | "existente";
}

export interface MateriaImportConfirmItem {
  nome: string;
  codigo: string;
}

export interface MateriaImportConfirmResult {
  created: Materia[];
  errors: { codigo: string; message: string }[];
}

export const materiaImportService = {
  async preview(buffer: Buffer): Promise<MateriaImportPreviewItem[]> {
    const parsed = await parseMateriasFromPdf(buffer);
    const existing = await materiaRepository.findByCodigos(parsed.map((m) => m.codigo));
    const existingCodigos = new Set(existing.filter((m) => m.ativo).map((m) => m.codigo));
    return parsed.map((m) => ({
      ...m,
      status: existingCodigos.has(m.codigo) ? "existente" : "novo"
    }));
  },

  async confirm(items: MateriaImportConfirmItem[]): Promise<MateriaImportConfirmResult> {
    const created: Materia[] = [];
    const errors: { codigo: string; message: string }[] = [];
    for (const item of items) {
      try {
        created.push(await materiaService.create(item));
      } catch (err) {
        errors.push({
          codigo: item.codigo,
          message: err instanceof Error ? err.message : "erro desconhecido"
        });
      }
    }
    return { created, errors };
  }
};
