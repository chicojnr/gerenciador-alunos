import { apiClient } from "../../../core/apiClient.js";
import type {
  Indicador,
  CreateIndicadorInput,
  UpdateIndicadorInput,
  AvaliacaoIndicador
} from "../types.js";

interface IndicadorListResponse {
  items: Indicador[];
  total: number;
}

export const indicadoresService = {
  list: () => apiClient.get<IndicadorListResponse>("/indicadores"),
  create: (data: CreateIndicadorInput) => apiClient.post<Indicador>("/indicadores", data),
  update: (id: string, data: UpdateIndicadorInput) =>
    apiClient.put<Indicador>(`/indicadores/${id}`, data),
  remove: (id: string) => apiClient.del<Indicador>(`/indicadores/${id}`),
  avaliacao: () => apiClient.get<AvaliacaoIndicador[]>("/indicadores/avaliacao")
};
