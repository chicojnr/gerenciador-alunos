import type { TipoDiaNaoLetivo } from "@prisma/client";

export interface CreateDiaNaoLetivoInput {
  data: string;
  tipo: TipoDiaNaoLetivo;
  descricao?: string;
}
