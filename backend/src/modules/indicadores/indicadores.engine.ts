const DIA_MS = 86_400_000;

export function toDiaNumero(data: Date): number {
  return Math.floor(data.getTime() / DIA_MS);
}

export function ehFimDeSemana(diaNumero: number): boolean {
  const diaSemana = new Date(diaNumero * DIA_MS).getUTCDay();
  return diaSemana === 0 || diaSemana === 6;
}

// Verdadeiro se todo dia estritamente entre `diaMenor` e `diaMaior` é não
// letivo — ou seja, se o intervalo entre duas faltas é inteiramente coberto
// por fins de semana/feriados/pontes/férias, e portanto não representa uma
// quebra real da sequência.
function apenasDiasNaoLetivosEntre(
  diaMenor: number,
  diaMaior: number,
  ehDiaNaoLetivo: (dia: number) => boolean
): boolean {
  for (let dia = diaMenor + 1; dia < diaMaior; dia++) {
    if (!ehDiaNaoLetivo(dia)) {
      return false;
    }
  }
  return true;
}

// Uma sequência só é considerada "em aberto" se a falta mais recente está a
// no máximo esta quantidade de dias corridos da referência — cobre um fim de
// semana entre a última falta e a avaliação. Sem isso, uma sequência antiga
// e já resolvida nunca deixaria de ser sinalizada (não há registro de
// presença, só de falta, então não há como saber que o aluno voltou a não
// ser pela passagem do tempo).
const TOLERANCIA_SEQUENCIA_DIAS = 3;

// Tamanho da sequência de faltas terminando na falta mais recente do aluno.
// Duas faltas em dias não consecutivos ainda contam como uma sequência
// contínua se todos os dias entre elas são não letivos (fim de semana por
// padrão; o chamador pode injetar feriados/pontes/férias da escola via
// `ehDiaNaoLetivo`) — uma falta em dia isolado conta como sequência de 1.
// Retorna 0 se a sequência mais recente já está encerrada há mais de
// `TOLERANCIA_SEQUENCIA_DIAS` dias corridos da referência.
export function sequenciaAteMaisRecente(
  datas: Date[],
  referencia: Date = new Date(),
  ehDiaNaoLetivo: (diaNumero: number) => boolean = ehFimDeSemana
): number {
  if (datas.length === 0) {
    return 0;
  }
  const dias = [...new Set(datas.map(toDiaNumero))].sort((a, b) => b - a);
  if (toDiaNumero(referencia) - dias[0] > TOLERANCIA_SEQUENCIA_DIAS) {
    return 0;
  }
  let sequencia = 1;
  for (let i = 1; i < dias.length; i++) {
    if (apenasDiasNaoLetivosEntre(dias[i], dias[i - 1], ehDiaNaoLetivo)) {
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
