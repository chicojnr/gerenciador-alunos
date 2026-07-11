export interface CreateAlunoInput {
  nome: string;
  dataNascimento?: string;
  turmaId: string;
}

export type UpdateAlunoInput = Partial<CreateAlunoInput>;
