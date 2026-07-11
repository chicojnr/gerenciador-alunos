export interface CreateResponsavelComunicacaoInput {
  nome: string;
  telefone?: string;
  email?: string;
  escolaId: string;
}

export type UpdateResponsavelComunicacaoInput = Partial<CreateResponsavelComunicacaoInput>;
