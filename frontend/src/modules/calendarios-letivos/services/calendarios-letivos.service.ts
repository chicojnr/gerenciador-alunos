import { apiClient } from "../../../core/apiClient.js";
import type {
  CalendarioLetivo,
  CreateCalendarioLetivoInput,
  UpdateCalendarioLetivoInput
} from "../types.js";

interface CalendarioLetivoListResponse {
  items: CalendarioLetivo[];
  total: number;
}

export const calendariosLetivosService = {
  list: () => apiClient.get<CalendarioLetivoListResponse>("/calendarios-letivos"),
  create: (data: CreateCalendarioLetivoInput) =>
    apiClient.post<CalendarioLetivo>("/calendarios-letivos", data),
  update: (id: string, data: UpdateCalendarioLetivoInput) =>
    apiClient.put<CalendarioLetivo>(`/calendarios-letivos/${id}`, data),
  remove: (id: string) => apiClient.del<CalendarioLetivo>(`/calendarios-letivos/${id}`)
};
