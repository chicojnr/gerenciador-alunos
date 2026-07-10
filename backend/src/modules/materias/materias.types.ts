export interface CreateMateriaInput {
  nome: string;
}

export type UpdateMateriaInput = Partial<CreateMateriaInput>;
