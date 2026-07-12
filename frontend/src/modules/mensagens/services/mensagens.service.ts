import { apiClient } from "../../../core/apiClient.js";
import type {
  Template,
  CreateTemplateInput,
  UpdateTemplateInput,
  EnviarMensagensInput,
  EnviarMensagensResultado,
  Envio
} from "../types.js";

interface TemplateListResponse {
  items: Template[];
  total: number;
}

export const mensagensService = {
  listTemplates: () => apiClient.get<TemplateListResponse>("/mensagens/templates"),
  createTemplate: (data: CreateTemplateInput) =>
    apiClient.post<Template>("/mensagens/templates", data),
  updateTemplate: (id: string, data: UpdateTemplateInput) =>
    apiClient.put<Template>(`/mensagens/templates/${id}`, data),
  removeTemplate: (id: string) => apiClient.del<Template>(`/mensagens/templates/${id}`),
  listEnvios: () => apiClient.get<Envio[]>("/mensagens/envios"),
  enviar: (data: EnviarMensagensInput) =>
    apiClient.post<EnviarMensagensResultado>("/mensagens/envios", data)
};
