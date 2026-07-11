import { apiClient } from "../../../core/apiClient.js";
import type { Professor, CreateProfessorInput, UpdateProfessorInput } from "../types.js";

interface ProfessorListResponse {
  items: Professor[];
  total: number;
}

export const professoresService = {
  list: () => apiClient.get<ProfessorListResponse>("/professores"),
  create: (data: CreateProfessorInput) => apiClient.post<Professor>("/professores", data),
  update: (id: string, data: UpdateProfessorInput) =>
    apiClient.put<Professor>(`/professores/${id}`, data),
  remove: (id: string) => apiClient.del<Professor>(`/professores/${id}`)
};
