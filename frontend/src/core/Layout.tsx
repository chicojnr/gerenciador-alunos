import { Outlet, Link } from "react-router-dom";

export function Layout() {
  return (
    <div>
      <nav>
        <Link to="/escolas">Escolas</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
