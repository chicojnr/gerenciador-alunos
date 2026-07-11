import type { Option } from "../../shared/types.js";

export interface Professor {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  escola: Option;
  ativo: boolean;
}

export interface CreateProfessorInput {
  nome: string;
  email?: string;
  telefone?: string;
  escolaId: string;
}

export type UpdateProfessorInput = Partial<CreateProfessorInput>;
