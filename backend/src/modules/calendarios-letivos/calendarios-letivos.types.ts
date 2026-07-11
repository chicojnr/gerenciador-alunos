export interface CreateCalendarioLetivoInput {
  nome: string;
  dataInicio: string;
  dataFim: string;
  escolaId: string;
}

export type UpdateCalendarioLetivoInput = Partial<CreateCalendarioLetivoInput>;
