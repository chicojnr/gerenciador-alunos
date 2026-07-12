import type { FastifyInstance } from "fastify";
import { dashboardService } from "./dashboard.service.js";
import { requireAuth } from "../../core/auth-hook.js";
import type { Config } from "../../core/config.js";

export function registerDashboardRoutes(app: FastifyInstance, config: Config) {
  app.get("/dashboard/resumo", { preHandler: requireAuth(config) }, async () => {
    return dashboardService.resumo();
  });
}
