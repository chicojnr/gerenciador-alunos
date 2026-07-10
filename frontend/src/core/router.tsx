import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./Layout.js";
import { LoginPage } from "../auth/LoginPage.js";
import { RouteGuard } from "../auth/RouteGuard.js";
import { EscolasPage } from "../modules/escolas/pages/EscolasPage.js";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <RouteGuard>
        <Layout />
      </RouteGuard>
    ),
    children: [{ path: "escolas", element: <EscolasPage /> }]
  }
]);
