import { apiClient } from "../../../core/apiClient.js";
import type { DashboardResumo } from "../types.js";

export const dashboardService = {
  resumo: () => apiClient.get<DashboardResumo>("/dashboard/resumo")
};
