export interface NotaLancamento {
  alunoId: string;
  valor: number | null;
}

export interface LancarNotasInput {
  materiaId: string;
  bimestre: number;
  notas: NotaLancamento[];
}
