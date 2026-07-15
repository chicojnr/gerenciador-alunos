export interface CreateMateriaInput {
  nome: string;
  codigo: string;
}

export type UpdateMateriaInput = Partial<CreateMateriaInput>;
