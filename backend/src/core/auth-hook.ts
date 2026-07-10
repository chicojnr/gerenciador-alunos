import type { FastifyReply, FastifyRequest } from "fastify";
import { verifyToken } from "./jwt.js";
import type { Config } from "./config.js";

export function requireAuth(config: Config) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.cookies.access_token;
    if (!token) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    try {
      const payload = verifyToken(token, config.jwtAccessSecret);
      request.user = { id: payload.userId };
    } catch {
      return reply.code(401).send({ error: "Unauthorized" });
    }
  };
}
