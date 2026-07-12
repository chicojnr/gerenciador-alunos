import { useEffect, useState } from "react";
import { LayoutDashboard, School, Users2, GraduationCap, BookUser, CalendarX2 } from "lucide-react";
import { dashboardService } from "../services/dashboard.service.js";
import { StatCard } from "../components/StatCard.js";
import { BarList } from "../components/BarList.js";
import type { DashboardResumo } from "../types.js";

export function DashboardPage() {
  const [resumo, setResumo] = useState<DashboardResumo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.resumo().then((data) => {
      setResumo(data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center gap-2.5">
        <LayoutDashboard className="h-5 w-5 text-zinc-400" strokeWidth={2} />
        <h1 className="text-xl font-semibold text-zinc-900">Dashboard</h1>
      </div>

      {loading || !resumo ? (
        <p className="text-sm text-zinc-400">Carregando...</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <StatCard icon={School} label="Escolas" value={resumo.totais.escolas} />
            <StatCard icon={GraduationCap} label="Turmas" value={resumo.totais.turmas} />
            <StatCard icon={Users2} label="Alunos" value={resumo.totais.alunos} />
            <StatCard icon={BookUser} label="Professores" value={resumo.totais.professores} />
            <StatCard icon={CalendarX2} label="Faltas (30 dias)" value={resumo.faltas30Dias} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <h2 className="mb-4 text-sm font-medium text-zinc-700">Faltas por turma</h2>
              <BarList
                items={resumo.faltasPorTurma.map((t) => ({ label: t.turmaNome, value: t.total }))}
                accentClassName="bg-rose-500"
              />
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <h2 className="mb-4 text-sm font-medium text-zinc-700">Média de notas por matéria</h2>
              <BarList
                items={resumo.mediaNotasPorMateria.map((m) => ({ label: m.materiaNome, value: m.media }))}
                formatValue={(v) => v.toFixed(1)}
                accentClassName="bg-indigo-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
