export interface Template {
  id: string;
  nome: string;
  conteudo: string;
  ativo: boolean;
}

export interface CreateTemplateInput {
  nome: string;
  conteudo: string;
}

export type UpdateTemplateInput = Partial<CreateTemplateInput>;

export interface EnviarMensagensInput {
  templateId: string;
  alunoIds: string[];
}

export interface EnviarMensagensResultado {
  registrados: number;
  semResponsavel: { id: string; nome: string }[];
  semTelefone: { id: string; nome: string; responsavel: string }[];
}

export interface Envio {
  id: string;
  mensagem: string;
  telefone: string | null;
  status: string;
  createdAt: string;
  aluno: { id: string; nome: string };
  responsavel: { id: string; nome: string };
  template: { id: string; nome: string };
}
