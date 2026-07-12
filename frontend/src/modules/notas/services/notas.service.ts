import { apiClient } from "../../../core/apiClient.js";
import type { LancarNotasInput, NotaLancamento } from "../types.js";

export const notasService = {
  listByTurmaMateriaBimestre: (turmaId: string, materiaId: string, bimestre: number) =>
    apiClient.get<{ notas: NotaLancamento[] }>(
      `/notas?turmaId=${turmaId}&materiaId=${materiaId}&bimestre=${bimestre}`
    ),
  lancar: (data: LancarNotasInput) => apiClient.post<{ lancadas: number }>("/notas/lote", data)
};
