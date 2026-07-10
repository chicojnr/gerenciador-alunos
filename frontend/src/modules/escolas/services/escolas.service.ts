import { apiClient } from "../../../core/apiClient.js";
import type { Escola, CreateEscolaInput, UpdateEscolaInput } from "../types.js";

interface EscolaListResponse {
  items: Escola[];
  total: number;
}

export const escolasService = {
  list: () => apiClient.get<EscolaListResponse>("/escolas"),
  create: (data: CreateEscolaInput) => apiClient.post<Escola>("/escolas", data),
  update: (id: string, data: UpdateEscolaInput) => apiClient.put<Escola>(`/escolas/${id}`, data),
  remove: (id: string) => apiClient.del<Escola>(`/escolas/${id}`)
};
