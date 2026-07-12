import type { TipoIndicador } from "@prisma/client";

export interface CreateIndicadorInput {
  nome: string;
  tipo: TipoIndicador;
  quantidade: number;
  janelaDias?: number;
}

export type UpdateIndicadorInput = Partial<CreateIndicadorInput>;
