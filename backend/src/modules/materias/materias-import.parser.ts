import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

export class MateriaImportParseError extends Error {}

export interface PositionedToken {
  str: string;
  x: number;
  y: number;
}

export interface ParsedMateria {
  nome: string;
  codigo: string;
}

function nearestIndex(anchors: PositionedToken[], x: number): number {
  let best = 0;
  let bestDist = Infinity;
  anchors.forEach((anchor, i) => {
    const dist = Math.abs(anchor.x - x);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  });
  return best;
}

const CODE_FRAGMENT_GAP_THRESHOLD = 20;

function mergeAdjacentNumericTokens(tokens: PositionedToken[]): PositionedToken[] {
  const sorted = [...tokens].sort((a, b) => a.x - b.x);
  const merged: PositionedToken[] = [];
  let lastX = -Infinity;
  for (const token of sorted) {
    const last = merged[merged.length - 1];
    if (last && token.x - lastX < CODE_FRAGMENT_GAP_THRESHOLD) {
      last.str = last.str + token.str;
    } else {
      merged.push({ ...token });
    }
    lastX = token.x;
  }
  return merged;
}

function joinTokens(tokens: PositionedToken[]): string {
  const sorted = [...tokens].sort((a, b) => a.y - b.y);
  let name = "";
  for (const token of sorted) {
    if (name === "") {
      name = token.str;
    } else if (/\S-$/.test(name)) {
      name = name + token.str;
    } else {
      name = name + " " + token.str;
    }
  }
  return name;
}

export function extractFromPageItems(items: PositionedToken[]): ParsedMateria[] | null {
  const sit = items.find((it) => it.str === "SIT");
  if (!sit) {
    return null;
  }
  const total = items.find((it) => it.str === "TOTAL" && Math.abs(it.y - sit.y) < 2);
  if (!total) {
    return null;
  }

  const zone = items.filter(
    (it) => it.x > sit.x + 5 && it.x < total.x - 5 && it.y >= sit.y - 20 && it.y <= sit.y + 40
  );

  const numericInZone = zone.filter((it) => /^\d+$/.test(it.str));
  if (numericInZone.length === 0) {
    return null;
  }
  const codeRowY = Math.min(...numericInZone.map((it) => it.y));
  const codes = mergeAdjacentNumericTokens(
    numericInZone.filter((it) => Math.abs(it.y - codeRowY) < 2)
  );

  const headerTokens = zone.filter((it) => it.y < codeRowY - 2 && !/^\d+$/.test(it.str));

  const groups: PositionedToken[][] = codes.map(() => []);
  for (const token of headerTokens) {
    groups[nearestIndex(codes, token.x)].push(token);
  }

  return codes.map((code, i) => ({
    nome: joinTokens(groups[i]),
    codigo: code.str
  }));
}

export async function parseMateriasFromPdf(buffer: Buffer): Promise<ParsedMateria[]> {
  const doc = await getDocument({ data: new Uint8Array(buffer) }).promise;

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();

    const items: PositionedToken[] = content.items
      .map((it) => {
        const raw = it as { str: string; transform: number[] };
        const [x, y] = viewport.convertToViewportPoint(raw.transform[4], raw.transform[5]);
        return { str: raw.str.trim(), x, y };
      })
      .filter((it) => it.str !== "");

    const result = extractFromPageItems(items);
    if (result && result.length > 0) {
      return result.filter((m) => m.codigo.trim() !== "");
    }
  }

  throw new MateriaImportParseError(
    "não foi possível reconhecer o layout do PDF (esperado relatório com colunas SIT e TOTAL)"
  );
}
