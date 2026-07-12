/*
  Warnings:

  - Added the required column `escolaId` to the `IndicadorFalta` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoDiaNaoLetivo" AS ENUM ('FERIADO', 'PONTE', 'FERIAS');

-- AlterTable
ALTER TABLE "IndicadorFalta" ADD COLUMN     "escolaId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "DiaNaoLetivo" (
    "id" TEXT NOT NULL,
    "escolaId" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "tipo" "TipoDiaNaoLetivo" NOT NULL,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiaNaoLetivo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiaNaoLetivo_escolaId_data_key" ON "DiaNaoLetivo"("escolaId", "data");

-- AddForeignKey
ALTER TABLE "IndicadorFalta" ADD CONSTRAINT "IndicadorFalta_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "Escola"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiaNaoLetivo" ADD CONSTRAINT "DiaNaoLetivo_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "Escola"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
