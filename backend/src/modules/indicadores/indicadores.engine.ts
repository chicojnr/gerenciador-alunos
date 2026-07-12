const DIA_MS = 86_400_000;

function toDiaNumero(data: Date): number {
  return Math.floor(data.getTime() / DIA_MS);
}

// Tamanho da sequência de faltas em dias corridos terminando na falta mais
// recente do aluno (uma falta em dia isolado conta como sequência de 1).
export function sequenciaAteMaisRecente(datas: Date[]): number {
  if (datas.length === 0) {
    return 0;
  }
  const dias = [...new Set(datas.map(toDiaNumero))].sort((a, b) => b - a);
  let sequencia = 1;
  for (let i = 1; i < dias.length; i++) {
    if (dias[i] === dias[i - 1] - 1) {
      sequencia++;
    } else {
      break;
    }
  }
  return sequencia;
}

// Quantidade de dias com falta dentro da janela de `janelaDias` dias corridos
// terminando em `referencia` (inclusive).
export function faltasNaJanela(datas: Date[], janelaDias: number, referencia: Date): number {
  const fim = toDiaNumero(referencia);
  const inicio = fim - janelaDias + 1;
  const dias = new Set(datas.map(toDiaNumero));
  let total = 0;
  for (const dia of dias) {
    if (dia >= inicio && dia <= fim) {
      total++;
    }
  }
  return total;
}
