import type { Option } from "../../shared/types.js";

export interface ResponsavelComunicacao {
  id: string;
  userId: string;
  user: { id: string; name: string; email: string };
  telefone: string | null;
  escola: Option;
  ativo: boolean;
}

export interface CreateResponsavelComunicacaoInput {
  userId: string;
  telefone?: string;
  escolaId: string;
}

export type UpdateResponsavelComunicacaoInput = Partial<CreateResponsavelComunicacaoInput>;
