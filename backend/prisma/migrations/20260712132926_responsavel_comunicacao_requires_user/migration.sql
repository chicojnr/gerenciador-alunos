/*
  Warnings:

  - You are about to drop the column `email` on the `ResponsavelComunicacao` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `ResponsavelComunicacao` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,escolaId]` on the table `ResponsavelComunicacao` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `ResponsavelComunicacao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ResponsavelComunicacao" DROP COLUMN "email",
DROP COLUMN "nome",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ResponsavelComunicacao_userId_escolaId_key" ON "ResponsavelComunicacao"("userId", "escolaId");

-- AddForeignKey
ALTER TABLE "ResponsavelComunicacao" ADD CONSTRAINT "ResponsavelComunicacao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
