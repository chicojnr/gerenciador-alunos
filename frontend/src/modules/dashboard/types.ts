export interface DashboardResumo {
  totais: {
    escolas: number;
    turmas: number;
    alunos: number;
    professores: number;
  };
  faltas30Dias: number;
  faltasPorTurma: { turmaId: string; turmaNome: string; total: number }[];
  mediaNotasPorMateria: { materiaId: string; materiaNome: string; media: number }[];
}
