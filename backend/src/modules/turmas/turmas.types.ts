export interface CreateTurmaInput {
  nome: string;
  serie: string;
  escolaId: string;
  periodoId: string;
}

export type UpdateTurmaInput = Partial<CreateTurmaInput>;
