import { prisma } from "../../core/prisma.js";

const DIA_MS = 86_400_000;

export const dashboardService = {
  async resumo() {
    const desde = new Date(Date.now() - 30 * DIA_MS);

    const [escolas, turmas, alunos, professores, faltas30Dias, faltasPorTurmaRaw, medias] =
      await Promise.all([
        prisma.escola.count({ where: { ativo: true } }),
        prisma.turma.count({ where: { ativo: true } }),
        prisma.aluno.count({ where: { ativo: true } }),
        prisma.professor.count({ where: { ativo: true } }),
        prisma.falta.count({ where: { data: { gte: desde } } }),
        prisma.falta.groupBy({
          by: ["alunoId"],
          where: { data: { gte: desde } },
          _count: { _all: true }
        }),
        prisma.nota.groupBy({ by: ["materiaId"], _avg: { valor: true } })
      ]);

    // groupBy não atravessa relações — resolve turma de cada aluno em memória.
    const alunosComFalta = await prisma.aluno.findMany({
      where: { id: { in: faltasPorTurmaRaw.map((f) => f.alunoId) } },
      select: { id: true, turma: { select: { id: true, nome: true } } }
    });
    const turmaPorAluno = new Map(alunosComFalta.map((a) => [a.id, a.turma]));
    const faltasPorTurmaMap = new Map<string, { turmaId: string; turmaNome: string; total: number }>();
    for (const grupo of faltasPorTurmaRaw) {
      const turma = turmaPorAluno.get(grupo.alunoId);
      if (!turma) {
        continue;
      }
      const atual = faltasPorTurmaMap.get(turma.id);
      if (atual) {
        atual.total += grupo._count._all;
      } else {
        faltasPorTurmaMap.set(turma.id, {
          turmaId: turma.id,
          turmaNome: turma.nome,
          total: grupo._count._all
        });
      }
    }
    const faltasPorTurma = [...faltasPorTurmaMap.values()].sort((a, b) => b.total - a.total);

    const materias = await prisma.materia.findMany({
      where: { id: { in: medias.map((m) => m.materiaId) } },
      select: { id: true, nome: true }
    });
    const nomePorMateria = new Map(materias.map((m) => [m.id, m.nome]));
    const mediaNotasPorMateria = medias
      .map((m) => ({
        materiaId: m.materiaId,
        materiaNome: nomePorMateria.get(m.materiaId) ?? "?",
        media: m._avg.valor ?? 0
      }))
      .sort((a, b) => b.media - a.media);

    return {
      totais: { escolas, turmas, alunos, professores },
      faltas30Dias,
      faltasPorTurma,
      mediaNotasPorMateria
    };
  }
};
