export type TipoDiaNaoLetivo = "FERIADO" | "PONTE" | "FERIAS";

export interface DiaNaoLetivo {
  id: string;
  escolaId: string;
  data: string;
  tipo: TipoDiaNaoLetivo;
  descricao: string | null;
}

export interface CreateDiaNaoLetivoInput {
  data: string;
  tipo: TipoDiaNaoLetivo;
  descricao?: string;
}
