export interface Escola {
  id: string;
  nome: string;
  cnpj: string | null;
  endereco: string | null;
  telefone: string | null;
  ativo: boolean;
}

export interface CreateEscolaInput {
  nome: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
}

export type UpdateEscolaInput = Partial<CreateEscolaInput>;
