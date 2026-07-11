import type { Option } from "../../shared/types.js";

export interface Aluno {
  id: string;
  nome: string;
  dataNascimento: string | null;
  turma: Option;
  ativo: boolean;
}

export interface CreateAlunoInput {
  nome: string;
  dataNascimento?: string;
  turmaId: string;
}

export type UpdateAlunoInput = Partial<CreateAlunoInput>;
