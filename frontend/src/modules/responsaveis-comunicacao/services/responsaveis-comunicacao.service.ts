import { apiClient } from "../../../core/apiClient.js";
import type {
  ResponsavelComunicacao,
  CreateResponsavelComunicacaoInput,
  UpdateResponsavelComunicacaoInput
} from "../types.js";

interface ResponsavelComunicacaoListResponse {
  items: ResponsavelComunicacao[];
  total: number;
}

export const responsaveisComunicacaoService = {
  list: () => apiClient.get<ResponsavelComunicacaoListResponse>("/responsaveis-comunicacao"),
  create: (data: CreateResponsavelComunicacaoInput) =>
    apiClient.post<ResponsavelComunicacao>("/responsaveis-comunicacao", data),
  update: (id: string, data: UpdateResponsavelComunicacaoInput) =>
    apiClient.put<ResponsavelComunicacao>(`/responsaveis-comunicacao/${id}`, data),
  remove: (id: string) => apiClient.del<ResponsavelComunicacao>(`/responsaveis-comunicacao/${id}`)
};
