import type { Option } from "../../shared/types.js";

export interface ResponsavelComunicacao {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  escola: Option;
  ativo: boolean;
}

export interface CreateResponsavelComunicacaoInput {
  nome: string;
  telefone?: string;
  email?: string;
  escolaId: string;
}

export type UpdateResponsavelComunicacaoInput = Partial<CreateResponsavelComunicacaoInput>;
