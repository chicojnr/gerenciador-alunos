import type { TipoIndicador } from "@prisma/client";

export interface CreateIndicadorInput {
  nome: string;
  tipo: TipoIndicador;
  quantidade: number;
  janelaDias?: number;
  escolaId: string;
}

export type UpdateIndicadorInput = Partial<CreateIndicadorInput>;
