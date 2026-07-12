import type { FastifyInstance } from "fastify";
import {
  templateService,
  envioService,
  TemplateNotFoundError,
  MensagemValidationError
} from "./mensagens.service.js";
import { requireAuth } from "../../core/auth-hook.js";
import type { Config } from "../../core/config.js";
import type {
  CreateTemplateInput,
  UpdateTemplateInput,
  EnviarMensagensInput
} from "./mensagens.types.js";

export function registerMensagensRoutes(app: FastifyInstance, config: Config) {
  const auth = { preHandler: requireAuth(config) };

  app.get<{ Querystring: { page?: string; pageSize?: string } }>(
    "/mensagens/templates",
    auth,
    async (request) => {
      const page = Number(request.query.page ?? 1);
      const pageSize = Number(request.query.pageSize ?? 20);
      return templateService.list(page, pageSize);
    }
  );

  app.post<{ Body: CreateTemplateInput }>("/mensagens/templates", auth, async (request, reply) => {
    try {
      const template = await templateService.create(request.body);
      return reply.code(201).send(template);
    } catch (err) {
      if (err instanceof MensagemValidationError) {
        return reply.code(400).send({ error: err.message });
      }
      throw err;
    }
  });

  app.put<{ Params: { id: string }; Body: UpdateTemplateInput }>(
    "/mensagens/templates/:id",
    auth,
    async (request, reply) => {
      try {
        return await templateService.update(request.params.id, request.body);
      } catch (err) {
        if (err instanceof TemplateNotFoundError) {
          return reply.code(404).send({ error: "Template não encontrado" });
        }
        if (err instanceof MensagemValidationError) {
          return reply.code(400).send({ error: err.message });
        }
        throw err;
      }
    }
  );

  app.delete<{ Params: { id: string } }>(
    "/mensagens/templates/:id",
    auth,
    async (request, reply) => {
      try {
        return await templateService.remove(request.params.id);
      } catch (err) {
        if (err instanceof TemplateNotFoundError) {
          return reply.code(404).send({ error: "Template não encontrado" });
        }
        throw err;
      }
    }
  );

  app.get("/mensagens/envios", auth, async () => {
    return envioService.listRecentes();
  });

  app.post<{ Body: EnviarMensagensInput }>("/mensagens/envios", auth, async (request, reply) => {
    try {
      const resultado = await envioService.enviar(request.body);
      return reply.code(201).send(resultado);
    } catch (err) {
      if (err instanceof TemplateNotFoundError) {
        return reply.code(404).send({ error: "Template não encontrado" });
      }
      if (err instanceof MensagemValidationError) {
        return reply.code(400).send({ error: err.message });
      }
      throw err;
    }
  });
}
