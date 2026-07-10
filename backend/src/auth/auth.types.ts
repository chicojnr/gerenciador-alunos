export interface LoginBody {
  email: string;
  password: string;
}

declare module "fastify" {
  interface FastifyRequest {
    user?: { id: string };
  }
}
