import { apiClient } from "../../../core/apiClient.js";
import type { Turma, CreateTurmaInput, UpdateTurmaInput } from "../types.js";

interface TurmaListResponse {
  items: Turma[];
  total: number;
}

export const turmasService = {
  list: () => apiClient.get<TurmaListResponse>("/turmas"),
  create: (data: CreateTurmaInput) => apiClient.post<Turma>("/turmas", data),
  update: (id: string, data: UpdateTurmaInput) => apiClient.put<Turma>(`/turmas/${id}`, data),
  remove: (id: string) => apiClient.del<Turma>(`/turmas/${id}`)
};
