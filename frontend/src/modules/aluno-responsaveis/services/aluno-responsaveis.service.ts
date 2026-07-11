import { apiClient } from "../../../core/apiClient.js";
import type { AlunoResponsavel, CreateAlunoResponsavelInput } from "../types.js";

export const alunoResponsaveisService = {
  list: (alunoId: string) => apiClient.get<AlunoResponsavel[]>(`/alunos/${alunoId}/responsaveis`),
  create: (alunoId: string, data: CreateAlunoResponsavelInput) =>
    apiClient.post<AlunoResponsavel>(`/alunos/${alunoId}/responsaveis`, data),
  remove: (alunoId: string, id: string) =>
    apiClient.del<AlunoResponsavel>(`/alunos/${alunoId}/responsaveis/${id}`)
};
