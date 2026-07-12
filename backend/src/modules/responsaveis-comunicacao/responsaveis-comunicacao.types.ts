export interface CreateResponsavelComunicacaoInput {
  userId: string;
  telefone?: string;
  escolaId: string;
}

export type UpdateResponsavelComunicacaoInput = Partial<CreateResponsavelComunicacaoInput>;
