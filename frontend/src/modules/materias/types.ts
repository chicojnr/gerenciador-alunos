export interface Materia {
  id: string;
  nome: string;
  codigo: string | null;
  ativo: boolean;
}

export interface CreateMateriaInput {
  nome: string;
  codigo: string;
}

export type UpdateMateriaInput = Partial<CreateMateriaInput>;

export interface MateriaImportPreviewItem {
  nome: string;
  codigo: string;
  status: "novo" | "existente";
}

export interface MateriaImportConfirmResult {
  created: Materia[];
  errors: { codigo: string; message: string }[];
}
