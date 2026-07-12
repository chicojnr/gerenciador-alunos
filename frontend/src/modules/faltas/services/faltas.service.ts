import { apiClient } from "../../../core/apiClient.js";
import type { RegistrarFaltasInput } from "../types.js";

export const faltasService = {
  diaByTurma: (turmaId: string, data: string) =>
    apiClient.get<{ alunoIds: string[] }>(`/faltas/dia?turmaId=${turmaId}&data=${data}`),
  registrar: (data: RegistrarFaltasInput) =>
    apiClient.post<{ alunoIds: string[] }>("/faltas/registro", data)
};
