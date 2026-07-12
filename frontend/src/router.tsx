import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./core/Layout.js";
import { LoginPage } from "./auth/LoginPage.js";
import { RouteGuard } from "./auth/RouteGuard.js";
import { AdminRoute } from "./auth/AdminRoute.js";
import { EscolasPage } from "./modules/escolas/pages/EscolasPage.js";
import { PeriodosPage } from "./modules/periodos/pages/PeriodosPage.js";
import { MateriasPage } from "./modules/materias/pages/MateriasPage.js";
import { UsuariosPage } from "./modules/usuarios/pages/UsuariosPage.js";
import { ProfessoresPage } from "./modules/professores/pages/ProfessoresPage.js";
import { TurmasPage } from "./modules/turmas/pages/TurmasPage.js";
import { AlunosPage } from "./modules/alunos/pages/AlunosPage.js";
import { ResponsaveisPage } from "./modules/responsaveis/pages/ResponsaveisPage.js";
import { CalendariosLetivosPage } from "./modules/calendarios-letivos/pages/CalendariosLetivosPage.js";
import { ResponsaveisComunicacaoPage } from "./modules/responsaveis-comunicacao/pages/ResponsaveisComunicacaoPage.js";
import { DashboardPage } from "./modules/dashboard/pages/DashboardPage.js";
import { FaltasPage } from "./modules/faltas/pages/FaltasPage.js";
import { AlertasPage } from "./modules/indicadores/pages/AlertasPage.js";
import { IndicadoresPage } from "./modules/indicadores/pages/IndicadoresPage.js";
import { DesempenhoPage } from "./modules/notas/pages/DesempenhoPage.js";
import { TemplatesPage } from "./modules/mensagens/pages/TemplatesPage.js";

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
      {
        path: "escolas",
        element: (
          <AdminRoute>
            <EscolasPage />
          </AdminRoute>
        )
      },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "faltas", element: <FaltasPage /> },
      { path: "alertas", element: <AlertasPage /> },
      { path: "desempenho", element: <DesempenhoPage /> },
      { path: "templates", element: <TemplatesPage /> },
      { path: "indicadores", element: <IndicadoresPage /> },
      { path: "periodos", element: <PeriodosPage /> },
      { path: "materias", element: <MateriasPage /> },
      { path: "professores", element: <ProfessoresPage /> },
      { path: "turmas", element: <TurmasPage /> },
      { path: "alunos", element: <AlunosPage /> },
      { path: "responsaveis", element: <ResponsaveisPage /> },
      { path: "calendarios-letivos", element: <CalendariosLetivosPage /> },
      { path: "responsaveis-comunicacao", element: <ResponsaveisComunicacaoPage /> },
      {
        path: "usuarios",
        element: (
          <AdminRoute>
            <UsuariosPage />
          </AdminRoute>
        )
      }
    ]
  }
]);
