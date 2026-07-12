export interface CreateTemplateInput {
  nome: string;
  conteudo: string;
}

export type UpdateTemplateInput = Partial<CreateTemplateInput>;

export interface EnviarMensagensInput {
  templateId: string;
  alunoIds: string[];
}
