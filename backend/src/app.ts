import Fastify, { FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import { loadConfig } from "./core/config.js";
import { registerAuthRoutes } from "./auth/auth.routes.js";
import { registerEscolasRoutes } from "./modules/escolas/escolas.routes.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });
  const config = loadConfig();

  await app.register(cors, { origin: true, credentials: true });
  await app.register(cookie);

  app.get("/health", async () => ({ status: "ok" }));

  registerAuthRoutes(app, config);
  registerEscolasRoutes(app, config);

  return app;
}
