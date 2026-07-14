import Fastify, { FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import { loadConfig } from "./core/config.js";
import { registerAuthRoutes } from "./auth/auth.routes.js";
import { registerEscolasRoutes } from "./modules/escolas/escolas.routes.js";
import { registerPeriodosRoutes } from "./modules/periodos/periodos.routes.js";
import { registerMateriasRoutes } from "./modules/materias/materias.routes.js";
import { registerUsuariosRoutes } from "./modules/usuarios/usuarios.routes.js";
import { registerProfessoresRoutes } from "./modules/professores/professores.routes.js";
import { registerTurmasRoutes } from "./modules/turmas/turmas.routes.js";
import { registerTurmaMateriasRoutes } from "./modules/turma-materias/turma-materias.routes.js";
import { registerAlunosRoutes } from "./modules/alunos/alunos.routes.js";
import { registerSituacoesAlunoRoutes } from "./modules/situacoes-aluno/situacoes-aluno.routes.js";
import { registerResponsaveisRoutes } from "./modules/responsaveis/responsaveis.routes.js";
import { registerAlunoResponsaveisRoutes } from "./modules/aluno-responsaveis/aluno-responsaveis.routes.js";
import { registerAlunoSituacoesRoutes } from "./modules/aluno-situacoes/aluno-situacoes.routes.js";
import { registerCalendariosLetivosRoutes } from "./modules/calendarios-letivos/calendarios-letivos.routes.js";
import { registerResponsaveisComunicacaoRoutes } from "./modules/responsaveis-comunicacao/responsaveis-comunicacao.routes.js";
import { registerFaltasRoutes } from "./modules/faltas/faltas.routes.js";
import { registerIndicadoresRoutes } from "./modules/indicadores/indicadores.routes.js";
import { registerNotasRoutes } from "./modules/notas/notas.routes.js";
import { registerMensagensRoutes } from "./modules/mensagens/mensagens.routes.js";
import { registerDashboardRoutes } from "./modules/dashboard/dashboard.routes.js";
import { registerDiasNaoLetivosRoutes } from "./modules/dias-nao-letivos/dias-nao-letivos.routes.js";

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
  registerProfessoresRoutes(app, config);
  registerTurmasRoutes(app, config);
  registerTurmaMateriasRoutes(app, config);
  registerAlunosRoutes(app, config);
  registerSituacoesAlunoRoutes(app, config);
  registerResponsaveisRoutes(app, config);
  registerAlunoResponsaveisRoutes(app, config);
  registerAlunoSituacoesRoutes(app, config);
  registerCalendariosLetivosRoutes(app, config);
  registerResponsaveisComunicacaoRoutes(app, config);
  registerFaltasRoutes(app, config);
  registerIndicadoresRoutes(app, config);
  registerNotasRoutes(app, config);
  registerMensagensRoutes(app, config);
  registerDashboardRoutes(app, config);
  registerDiasNaoLetivosRoutes(app, config);

  return app;
}
