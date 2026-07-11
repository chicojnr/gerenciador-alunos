export interface CreateProfessorInput {
  nome: string;
  email?: string;
  telefone?: string;
  escolaId: string;
}

export type UpdateProfessorInput = Partial<CreateProfessorInput>;
