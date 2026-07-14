export interface SituacaoAluno {
  id: string;
  nome: string;
  ativo: boolean;
}

export interface CreateSituacaoAlunoInput {
  nome: string;
}

export type UpdateSituacaoAlunoInput = Partial<CreateSituacaoAlunoInput>;
