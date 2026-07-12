-- CreateEnum
CREATE TYPE "TipoIndicador" AS ENUM ('CONSECUTIVAS', 'NAO_CONSECUTIVAS');

-- CreateTable
CREATE TABLE "Falta" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Falta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndicadorFalta" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoIndicador" NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "janelaDias" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndicadorFalta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nota" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "materiaId" TEXT NOT NULL,
    "bimestre" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MensagemTemplate" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MensagemTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnvioMensagem" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "responsavelId" TEXT NOT NULL,
    "telefone" TEXT,
    "mensagem" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REGISTRADO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnvioMensagem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Falta_alunoId_data_key" ON "Falta"("alunoId", "data");

-- CreateIndex
CREATE UNIQUE INDEX "Nota_alunoId_materiaId_bimestre_key" ON "Nota"("alunoId", "materiaId", "bimestre");

-- CreateIndex
CREATE UNIQUE INDEX "MensagemTemplate_nome_key" ON "MensagemTemplate"("nome");

-- AddForeignKey
ALTER TABLE "Falta" ADD CONSTRAINT "Falta_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvioMensagem" ADD CONSTRAINT "EnvioMensagem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "MensagemTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvioMensagem" ADD CONSTRAINT "EnvioMensagem_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvioMensagem" ADD CONSTRAINT "EnvioMensagem_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Responsavel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
