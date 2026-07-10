export interface Materia {
  id: string;
  nome: string;
  ativo: boolean;
}

export interface CreateMateriaInput {
  nome: string;
}

export type UpdateMateriaInput = Partial<CreateMateriaInput>;
