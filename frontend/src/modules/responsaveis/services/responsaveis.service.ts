import { apiClient } from "../../../core/apiClient.js";
import type { Responsavel, CreateResponsavelInput, UpdateResponsavelInput } from "../types.js";

interface ResponsavelListResponse {
  items: Responsavel[];
  total: number;
}

export const responsaveisService = {
  list: () => apiClient.get<ResponsavelListResponse>("/responsaveis"),
  create: (data: CreateResponsavelInput) => apiClient.post<Responsavel>("/responsaveis", data),
  update: (id: string, data: UpdateResponsavelInput) =>
    apiClient.put<Responsavel>(`/responsaveis/${id}`, data),
  remove: (id: string) => apiClient.del<Responsavel>(`/responsaveis/${id}`)
};
