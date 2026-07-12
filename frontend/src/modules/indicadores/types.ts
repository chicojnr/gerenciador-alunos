export type TipoIndicador = "CONSECUTIVAS" | "NAO_CONSECUTIVAS";

export interface Indicador {
  id: string;
  nome: string;
  tipo: TipoIndicador;
  quantidade: number;
  janelaDias: number | null;
  ativo: boolean;
}

export interface CreateIndicadorInput {
  nome: string;
  tipo: TipoIndicador;
  quantidade: number;
  janelaDias?: number;
}

export type UpdateIndicadorInput = Partial<CreateIndicadorInput>;

export interface AlunoAlerta {
  id: string;
  nome: string;
  turma: { id: string; nome: string };
  faltas: number;
}

export interface AvaliacaoIndicador {
  indicador: Indicador;
  alunos: AlunoAlerta[];
}
