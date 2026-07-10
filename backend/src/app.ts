import Fastify, { FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import { loadConfig } from "./core/config.js";
import { registerAuthRoutes } from "./auth/auth.routes.js";
import { registerEscolasRoutes } from "./modules/escolas/escolas.routes.js";
import { registerPeriodosRoutes } from "./modules/periodos/periodos.routes.js";
import { registerMateriasRoutes } from "./modules/materias/materias.routes.js";
import { registerUsuariosRoutes } from "./modules/usuarios/usuarios.routes.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });
  const config = loadConfig();

  await app.register(cors, { origin: true, credentials: true });
  await app.register(cookie);

  app.get("/health", async () => ({ status: "ok" }));

  registerAuthRoutes(app, config);
  registerEscolasRoutes(app, config);
  registerPeriodosRoutes(app, config);
  registerMateriasRoutes(app, config);
  registerUsuariosRoutes(app, config);

  return app;
}
