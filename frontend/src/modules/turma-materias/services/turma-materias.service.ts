import { apiClient } from "../../../core/apiClient.js";
import type { TurmaMateria, CreateTurmaMateriaInput } from "../types.js";

export const turmaMateriasService = {
  list: (turmaId: string) => apiClient.get<TurmaMateria[]>(`/turmas/${turmaId}/materias`),
  create: (turmaId: string, data: CreateTurmaMateriaInput) =>
    apiClient.post<TurmaMateria>(`/turmas/${turmaId}/materias`, data),
  remove: (turmaId: string, id: string) =>
    apiClient.del<TurmaMateria>(`/turmas/${turmaId}/materias/${id}`)
};
