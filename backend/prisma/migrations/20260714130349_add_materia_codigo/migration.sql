-- DropIndex
DROP INDEX "Materia_nome_key";

-- AlterTable
ALTER TABLE "Materia" ADD COLUMN "codigo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Materia_codigo_key" ON "Materia"("codigo");
