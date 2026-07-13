# Situação do Aluno — Design

## Contexto

Aluno precisa de um status acadêmico ("situação"): Ativo, Baixa Transferência,
Transferido, Remanejamento. Deve ser um cadastro administrável (não enum fixo
no código) e as 4 opções acima já devem existir na base assim que a migration
rodar. Toda mudança de situação de um aluno precisa ficar registrada em
histórico, com a data da mudança.

Isso é independente do campo `Aluno.ativo` já existente, que controla apenas
soft-delete do registro de cadastro (aluno removido do sistema). Um aluno pode
estar `ativo = true` e ter situação "Transferido", por exemplo.

## Modelo de dados (Prisma)

```prisma
model SituacaoAluno {
  id        String   @id @default(uuid())
  nome      String   @unique
  ativo     Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  alunos    Aluno[]
  historico AlunoSituacaoHistorico[]
}

model Aluno {
  ...
  situacaoAtualId String
  situacaoAtual   SituacaoAluno @relation(fields: [situacaoAtualId], references: [id])
  situacoesHistorico AlunoSituacaoHistorico[]
}

model AlunoSituacaoHistorico {
  id           String        @id @default(uuid())
  alunoId      String
  aluno        Aluno         @relation(fields: [alunoId], references: [id])
  situacaoId   String
  situacao     SituacaoAluno @relation(fields: [situacaoId], references: [id])
  dataMudanca  DateTime      @db.Date
  observacao   String?
  createdAt    DateTime      @default(now())
}
```

`situacaoAtualId` é denormalizado (mesmo padrão de `Aluno.turmaId`) pra listar/
filtrar sem precisar calcular o último histórico a cada request. É sempre
mantido em sincronia com a entrada mais recente de `AlunoSituacaoHistorico`.

### Migration

Uma migration cria as duas tabelas, insere as 4 `SituacaoAluno` (nome exato:
"Ativo", "Baixa Transferência", "Transferido", "Remanejamento"), faz backfill
de `Aluno.situacaoAtualId` apontando pra "Ativo" pra todo aluno já existente, e
cria uma linha de histórico inicial (dataMudanca = createdAt do aluno) pra
cada um.

## Backend

### Módulo `situacoes-aluno` (cadastro, clone do padrão `periodos`)

CRUD completo — list (paginado, só `ativo=true`), getById, create, update
(nome), soft-delete. Mesma estrutura de arquivos: `.types.ts`, `.repository.ts`,
`.service.ts`, `.routes.ts` + testes. Rotas `/situacoes-aluno`, auth-only
(mesmo nível de acesso de períodos/matérias — não é ADMIN-only).

Existe pra permitir cadastrar situações adicionais no futuro além das 4
seedadas; a service valida nome não-vazio e não-duplicado, igual `periodoService`.

### Alunos: criação

`CreateAlunoInput` não ganha campo de situação. Ao criar um aluno, o service
sempre atribui a situação "Ativo" (busca por nome) e cria a primeira linha de
histórico com `dataMudanca = now()`. Se o registro seed "Ativo" não existir
(estado inconsistente), lança erro de validação — não deveria acontecer em uso
normal já que a migration garante a existência.

`UpdateAlunoInput` (PUT /alunos/:id) continua só nome/dataNascimento/turmaId —
não aceita mudança de situação, pra forçar todo mundo a passar pelo endpoint
dedicado abaixo e manter o histórico íntegro.

### Alunos: mudança de situação (endpoint dedicado)

- `POST /alunos/:id/situacoes` — body `{ situacaoId, dataMudanca, observacao? }`.
  Valida aluno existe, situação existe e está ativa. Cria linha de histórico e
  atualiza `Aluno.situacaoAtualId` numa transação.
- `GET /alunos/:id/situacoes` — lista histórico do aluno, mais recente primeiro.

Erros: `AlunoNotFoundError` (404), `SituacaoNotFoundError`/`SituacaoInativaError`
(400), seguindo o padrão de erros já usado no módulo.

## Frontend

### Módulo `situacoes-aluno` (clone do módulo `periodos`)

`SituacaoForm`, `SituacaoList`, `useSituacoes` hook, `SituacoesPage`,
`situacoes.service.ts`, `types.ts`. Nova entrada de navegação "Situações" nos
cadastros, mesmo nível dos outros cadastros (Períodos, Matérias, etc).

### Select de situação (reuso)

Novo hook `useSituacaoOptions` (`shared/hooks`), clone de `useTurmaOptions`,
consumido pelo painel de mudança de situação e por um filtro futuro de lista
de alunos (fora de escopo agora, mas o hook fica pronto).

### AlunoList

Nova coluna "Situação" mostrando `aluno.situacaoAtual.nome`.

### AlunoSituacaoPanel (novo componente, mesmo padrão de `AlunoResponsavelPanel`)

Renderizado dentro do modal de edição do Aluno (só quando `editing` existe,
igual o painel de responsáveis). Mostra:
- Situação atual (badge/texto).
- Lista de histórico (data + nome da situação + observação), mais recente primeiro.
- Form pequeno: select de situação + input de data (default hoje) + observação
  opcional + botão "Mudar situação".

Mudança de situação exige confirmação via `useConfirm` (mesmo padrão de toda
edição/exclusão no app, estabelecido no commit `3abc9fd`) antes de chamar o
endpoint.

`Aluno` (type do frontend) ganha `situacaoAtual: { id: string; nome: string }`.

## Fora de escopo

- Filtro de lista de alunos por situação (hook de options fica pronto, mas UI
  de filtro não é pedida agora).
- ADMIN-only no cadastro de situações — segue mesmo nível de acesso dos demais
  cadastros auth-only.
