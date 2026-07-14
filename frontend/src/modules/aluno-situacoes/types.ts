import type { Option } from "../../shared/types.js";

export interface AlunoSituacaoHistorico {
  id: string;
  situacao: Option;
  dataMudanca: string;
  observacao: string | null;
  createdAt: string;
}

export interface CreateAlunoSituacaoInput {
  situacaoId: string;
  dataMudanca: string;
  observacao?: string;
}
