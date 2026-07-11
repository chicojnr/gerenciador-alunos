import type { Option } from "../../shared/types.js";

export interface CalendarioLetivo {
  id: string;
  nome: string;
  dataInicio: string;
  dataFim: string;
  escola: Option;
  ativo: boolean;
}

export interface CreateCalendarioLetivoInput {
  nome: string;
  dataInicio: string;
  dataFim: string;
  escolaId: string;
}

export type UpdateCalendarioLetivoInput = Partial<CreateCalendarioLetivoInput>;
