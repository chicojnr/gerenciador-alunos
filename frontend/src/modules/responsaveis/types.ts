export interface Responsavel {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  ativo: boolean;
}

export interface CreateResponsavelInput {
  nome: string;
  telefone?: string;
  email?: string;
}

export type UpdateResponsavelInput = Partial<CreateResponsavelInput>;
