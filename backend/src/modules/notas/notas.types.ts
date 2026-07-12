export interface NotaLancamento {
  alunoId: string;
  valor: number;
}

export interface LancarNotasInput {
  materiaId: string;
  bimestre: number;
  notas: NotaLancamento[];
}
