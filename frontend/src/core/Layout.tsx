import { Outlet, Link, useLocation } from "react-router-dom";
import {
  GraduationCap,
  Building2,
  Clock,
  BookOpen,
  UserRound,
  Layers,
  Users,
  GraduationCap as StudentIcon,
  Contact,
  CalendarDays,
  MessageCircle,
  LogOut,
  LayoutDashboard,
  CalendarX2,
  AlertTriangle,
  LineChart,
  MessagesSquare,
  SlidersHorizontal,
  CalendarOff,
  Repeat2
} from "lucide-react";
import { useAuth } from "../auth/AuthContext.js";
import { AuthExpiredModal } from "../auth/AuthExpiredModal.js";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { to: "/faltas", label: "Faltas", icon: CalendarX2, adminOnly: false },
  { to: "/alertas", label: "Alertas", icon: AlertTriangle, adminOnly: false },
  { to: "/desempenho", label: "Desempenho", icon: LineChart, adminOnly: false },
  { to: "/escolas", label: "Escolas", icon: Building2, adminOnly: true },
  { to: "/periodos", label: "Períodos", icon: Clock, adminOnly: false },
  { to: "/materias", label: "Disciplinas", icon: BookOpen, adminOnly: false },
  { to: "/professores", label: "Professores", icon: UserRound, adminOnly: false },
  { to: "/turmas", label: "Turmas", icon: Layers, adminOnly: false },
  { to: "/alunos", label: "Alunos", icon: StudentIcon, adminOnly: false },
  { to: "/situacoes-aluno", label: "Situações", icon: Repeat2, adminOnly: false },
  { to: "/responsaveis", label: "Pais/Responsáveis", icon: Contact, adminOnly: false },
  { to: "/calendarios-letivos", label: "Calendário Letivo", icon: CalendarDays, adminOnly: false },
  { to: "/dias-nao-letivos", label: "Dias Não Letivos", icon: CalendarOff, adminOnly: false },
  {
    to: "/responsaveis-comunicacao",
    label: "Resp. Comunicação",
    icon: MessageCircle,
    adminOnly: false
  },
  { to: "/templates", label: "Templates", icon: MessagesSquare, adminOnly: false },
  { to: "/indicadores", label: "Indicadores", icon: SlidersHorizontal, adminOnly: false },
  { to: "/usuarios", label: "Usuários", icon: Users, adminOnly: true }
];

export function Layout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || user?.role === "ADMIN");
  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]!.toUpperCase())
        .join("")
    : "";

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <AuthExpiredModal />
      <aside className="flex w-64 flex-col bg-zinc-900">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-lg shadow-indigo-950/40">
            <GraduationCap className="h-4.5 w-4.5 text-white" strokeWidth={2.25} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-white">
            GerenciadorAlunos
          </span>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 pt-2">
          {visibleItems.map((item) => {
            const active = location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  "group relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 " +
                  (active ? "bg-zinc-800/80 text-white" : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200")
                }
              >
                {active && (
                  <span className="absolute -left-3 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-indigo-500" />
                )}
                <Icon
                  className={
                    "h-4 w-4 shrink-0 transition-colors duration-150 " +
                    (active ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300")
                  }
                  strokeWidth={2}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5 border-t border-zinc-800/80 px-4 py-3.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-zinc-200">{user?.name}</p>
            <p className="truncate text-[11px] text-zinc-500">
              {user?.role === "ADMIN" ? "Administrador" : "Usuário"}
            </p>
          </div>
          <button
            onClick={() => logout()}
            aria-label="Sair"
            title="Sair"
            className="rounded-md p-1.5 text-zinc-500 transition-colors duration-150 hover:bg-zinc-800 hover:text-zinc-200"
          >
            <LogOut className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <div key={location.pathname} className="animate-page-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
