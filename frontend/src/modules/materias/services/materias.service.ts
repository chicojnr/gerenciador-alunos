import { apiClient } from "../../../core/apiClient.js";
import type {
  Materia,
  CreateMateriaInput,
  UpdateMateriaInput,
  MateriaImportPreviewItem,
  MateriaImportConfirmResult
} from "../types.js";

interface MateriaListResponse {
  items: Materia[];
  total: number;
}

export const materiasService = {
  list: () => apiClient.get<MateriaListResponse>("/materias"),
  create: (data: CreateMateriaInput) => apiClient.post<Materia>("/materias", data),
  update: (id: string, data: UpdateMateriaInput) =>
    apiClient.put<Materia>(`/materias/${id}`, data),
  remove: (id: string) => apiClient.del<Materia>(`/materias/${id}`),
  importParse: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.postFile<{ items: MateriaImportPreviewItem[] }>(
      "/materias/import/parse",
      formData
    );
  },
  importConfirm: (items: { nome: string; codigo: string }[]) =>
    apiClient.post<MateriaImportConfirmResult>("/materias/import/confirm", { items })
};
