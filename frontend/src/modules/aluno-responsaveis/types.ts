export interface AlunoResponsavel {
  id: string;
  responsavel: {
    id: string;
    nome: string;
    telefone: string | null;
    email: string | null;
  };
}

export interface CreateAlunoResponsavelInput {
  responsavelId: string;
}
