import type { FastifyInstance } from "fastify";
import { login, InvalidCredentialsError } from "./auth.service.js";
import { signAccessToken, verifyToken } from "../core/jwt.js";
import { requireAuth } from "../core/auth-hook.js";
import { prisma } from "../core/prisma.js";
import type { Config } from "../core/config.js";
import type { LoginBody } from "./auth.types.js";

const COOKIE_OPTS = { httpOnly: true, path: "/", sameSite: "lax" as const };

export function registerAuthRoutes(app: FastifyInstance, config: Config) {
  app.get("/auth/me", { preHandler: requireAuth(config) }, async (request) => {
    return { userId: request.user!.id, role: request.user!.role };
  });

  app.post<{ Body: LoginBody }>("/auth/login", async (request, reply) => {
    try {
      const { email, password } = request.body;
      const result = await login(email, password, config);
      reply.setCookie("access_token", result.accessToken, COOKIE_OPTS);
      reply.setCookie("refresh_token", result.refreshToken, COOKIE_OPTS);
      return { userId: result.userId, role: result.role };
    } catch (err) {
      if (err instanceof InvalidCredentialsError) {
        return reply.code(401).send({ error: "Invalid credentials" });
      }
      throw err;
    }
  });

  app.post("/auth/refresh", async (request, reply) => {
    const refreshToken = request.cookies.refresh_token;
    if (!refreshToken) {
      return reply.code(401).send({ error: "Unauthorized" });
    }
    try {
      const payload = verifyToken(refreshToken, config.jwtRefreshSecret);
      const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user || !user.ativo) {
        return reply.code(401).send({ error: "Unauthorized" });
      }
      const accessToken = signAccessToken(user.id, user.role, config.jwtAccessSecret);
      reply.setCookie("access_token", accessToken, COOKIE_OPTS);
      return { ok: true };
    } catch {
      return reply.code(401).send({ error: "Unauthorized" });
    }
  });

  app.post("/auth/logout", async (_request, reply) => {
    reply.clearCookie("access_token", { path: "/" });
    reply.clearCookie("refresh_token", { path: "/" });
    return { ok: true };
  });
}
