import { apiClient } from "../../../core/apiClient.js";
import type { Materia, CreateMateriaInput, UpdateMateriaInput } from "../types.js";

interface MateriaListResponse {
  items: Materia[];
  total: number;
}

export const materiasService = {
  list: () => apiClient.get<MateriaListResponse>("/materias"),
  create: (data: CreateMateriaInput) => apiClient.post<Materia>("/materias", data),
  update: (id: string, data: UpdateMateriaInput) =>
    apiClient.put<Materia>(`/materias/${id}`, data),
  remove: (id: string) => apiClient.del<Materia>(`/materias/${id}`)
};
