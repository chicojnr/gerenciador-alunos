import type { Role } from "@prisma/client";

export interface LoginBody {
  email: string;
  password: string;
}

declare module "fastify" {
  interface FastifyRequest {
    user?: { id: string; role: Role; email: string; name: string };
  }
}
