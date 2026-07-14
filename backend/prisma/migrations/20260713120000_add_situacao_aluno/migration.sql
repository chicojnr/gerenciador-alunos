-- CreateTable
CREATE TABLE "SituacaoAluno" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SituacaoAluno_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SituacaoAluno_nome_key" ON "SituacaoAluno"("nome");

-- Seed default situações
INSERT INTO "SituacaoAluno" ("id", "nome", "ativo", "createdAt", "updatedAt") VALUES
    ('00000000-0000-0000-0000-000000000001', 'Ativo', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('00000000-0000-0000-0000-000000000002', 'Baixa Transferência', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('00000000-0000-0000-0000-000000000003', 'Transferido', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('00000000-0000-0000-0000-000000000004', 'Remanejamento', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AlterTable: add nullable first so existing rows can be backfilled below
ALTER TABLE "Aluno" ADD COLUMN "situacaoAtualId" TEXT;

-- Backfill every pre-existing aluno to "Ativo"
UPDATE "Aluno" SET "situacaoAtualId" = '00000000-0000-0000-0000-000000000001' WHERE "situacaoAtualId" IS NULL;

-- Now it's safe to make it required
ALTER TABLE "Aluno" ALTER COLUMN "situacaoAtualId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Aluno" ADD CONSTRAINT "Aluno_situacaoAtualId_fkey" FOREIGN KEY ("situacaoAtualId") REFERENCES "SituacaoAluno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "AlunoSituacaoHistorico" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "situacaoId" TEXT NOT NULL,
    "dataMudanca" DATE NOT NULL,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlunoSituacaoHistorico_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AlunoSituacaoHistorico" ADD CONSTRAINT "AlunoSituacaoHistorico_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlunoSituacaoHistorico" ADD CONSTRAINT "AlunoSituacaoHistorico_situacaoId_fkey" FOREIGN KEY ("situacaoId") REFERENCES "SituacaoAluno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
