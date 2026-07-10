import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./core/Layout.js";
import { LoginPage } from "./auth/LoginPage.js";
import { RouteGuard } from "./auth/RouteGuard.js";
import { EscolasPage } from "./modules/escolas/pages/EscolasPage.js";
import { PeriodosPage } from "./modules/periodos/pages/PeriodosPage.js";
import { MateriasPage } from "./modules/materias/pages/MateriasPage.js";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <RouteGuard>
        <Layout />
      </RouteGuard>
    ),
    children: [
      { path: "escolas", element: <EscolasPage /> },
      { path: "periodos", element: <PeriodosPage /> },
      { path: "materias", element: <MateriasPage /> }
    ]
  }
]);
