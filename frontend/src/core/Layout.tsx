import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.js";

const NAV_ITEMS = [
  { to: "/escolas", label: "Escolas" },
  { to: "/periodos", label: "Períodos" },
  { to: "/materias", label: "Matérias" }
];

export function Layout() {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <aside className="flex w-60 flex-col bg-zinc-900 text-zinc-400">
        <div className="px-4 py-5 text-lg font-semibold text-white">GerenciadorAlunos</div>
        <nav className="flex-1 space-y-1 px-2">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  "block rounded-md px-3 py-2 text-sm font-medium " +
                  (active
                    ? "bg-zinc-800 text-indigo-300"
                    : "hover:bg-zinc-800/60 hover:text-zinc-200")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-zinc-800 px-4 py-4">
          <button onClick={() => logout()} className="text-sm font-medium hover:text-white">
            Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
