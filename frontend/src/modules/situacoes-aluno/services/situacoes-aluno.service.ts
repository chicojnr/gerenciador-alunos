import { apiClient } from "../../../core/apiClient.js";
import type { SituacaoAluno, CreateSituacaoAlunoInput, UpdateSituacaoAlunoInput } from "../types.js";

interface SituacaoAlunoListResponse {
  items: SituacaoAluno[];
  total: number;
}

export const situacoesAlunoService = {
  list: () => apiClient.get<SituacaoAlunoListResponse>("/situacoes-aluno"),
  create: (data: CreateSituacaoAlunoInput) =>
    apiClient.post<SituacaoAluno>("/situacoes-aluno", data),
  update: (id: string, data: UpdateSituacaoAlunoInput) =>
    apiClient.put<SituacaoAluno>(`/situacoes-aluno/${id}`, data),
  remove: (id: string) => apiClient.del<SituacaoAluno>(`/situacoes-aluno/${id}`)
};
