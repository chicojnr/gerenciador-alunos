import { apiClient } from "../../../core/apiClient.js";
import type { AlunoSituacaoHistorico, CreateAlunoSituacaoInput } from "../types.js";

export const alunoSituacoesService = {
  list: (alunoId: string) =>
    apiClient.get<AlunoSituacaoHistorico[]>(`/alunos/${alunoId}/situacoes`),
  change: (alunoId: string, data: CreateAlunoSituacaoInput) =>
    apiClient.post<AlunoSituacaoHistorico>(`/alunos/${alunoId}/situacoes`, data)
};
