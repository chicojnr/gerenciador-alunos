export interface Periodo {
  id: string;
  nome: string;
  ativo: boolean;
}

export interface CreatePeriodoInput {
  nome: string;
}

export type UpdatePeriodoInput = Partial<CreatePeriodoInput>;
