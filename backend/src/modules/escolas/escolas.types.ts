export interface CreateEscolaInput {
  nome: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
}

export type UpdateEscolaInput = Partial<CreateEscolaInput>;
