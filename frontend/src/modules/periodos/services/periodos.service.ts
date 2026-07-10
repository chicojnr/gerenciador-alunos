import { apiClient } from "../../../core/apiClient.js";
import type { Periodo, CreatePeriodoInput, UpdatePeriodoInput } from "../types.js";

interface PeriodoListResponse {
  items: Periodo[];
  total: number;
}

export const periodosService = {
  list: () => apiClient.get<PeriodoListResponse>("/periodos"),
  create: (data: CreatePeriodoInput) => apiClient.post<Periodo>("/periodos", data),
  update: (id: string, data: UpdatePeriodoInput) =>
    apiClient.put<Periodo>(`/periodos/${id}`, data),
  remove: (id: string) => apiClient.del<Periodo>(`/periodos/${id}`)
};
