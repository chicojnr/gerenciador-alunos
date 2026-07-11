export interface CreateResponsavelInput {
  nome: string;
  telefone?: string;
  email?: string;
}

export type UpdateResponsavelInput = Partial<CreateResponsavelInput>;
