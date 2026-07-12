import { apiClient } from "../../../core/apiClient.js";
import type { DiaNaoLetivo, CreateDiaNaoLetivoInput } from "../types.js";

export const diasNaoLetivosService = {
  listByEscola: (escolaId: string) =>
    apiClient.get<DiaNaoLetivo[]>(`/escolas/${escolaId}/dias-nao-letivos`),
  create: (escolaId: string, data: CreateDiaNaoLetivoInput) =>
    apiClient.post<DiaNaoLetivo>(`/escolas/${escolaId}/dias-nao-letivos`, data),
  remove: (id: string) => apiClient.del<DiaNaoLetivo>(`/dias-nao-letivos/${id}`)
};
