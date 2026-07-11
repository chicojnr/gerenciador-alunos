import type { Option } from "../../shared/types.js";

export interface Turma {
  id: string;
  nome: string;
  serie: string;
  escola: Option;
  periodo: Option;
  ativo: boolean;
}

export interface CreateTurmaInput {
  nome: string;
  serie: string;
  escolaId: string;
  periodoId: string;
}

export type UpdateTurmaInput = Partial<CreateTurmaInput>;
