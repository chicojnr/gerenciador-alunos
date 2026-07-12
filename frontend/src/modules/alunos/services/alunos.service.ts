import { apiClient } from "../../../core/apiClient.js";
import type { Aluno, CreateAlunoInput, UpdateAlunoInput } from "../types.js";

interface AlunoListResponse {
  items: Aluno[];
  total: number;
}

export const alunosService = {
  list: (turmaId?: string) =>
    apiClient.get<AlunoListResponse>(
      turmaId ? `/alunos?turmaId=${turmaId}&pageSize=200` : "/alunos"
    ),
  create: (data: CreateAlunoInput) => apiClient.post<Aluno>("/alunos", data),
  update: (id: string, data: UpdateAlunoInput) => apiClient.put<Aluno>(`/alunos/${id}`, data),
  remove: (id: string) => apiClient.del<Aluno>(`/alunos/${id}`)
};
