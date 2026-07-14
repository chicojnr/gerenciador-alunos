import { prisma } from "../src/core/prisma.js";

async function main() {
  const alunos = await prisma.aluno.findMany({
    where: { situacoesHistorico: { none: {} } }
  });

  for (const aluno of alunos) {
    await prisma.alunoSituacaoHistorico.create({
      data: {
        alunoId: aluno.id,
        situacaoId: aluno.situacaoAtualId,
        dataMudanca: aluno.createdAt
      }
    });
  }

  console.log(`Backfilled histórico de situação para ${alunos.length} aluno(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
