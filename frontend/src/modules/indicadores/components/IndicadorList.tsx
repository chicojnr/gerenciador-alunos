import { Trash2 } from "lucide-react";
import { Table } from "../../../shared/components/Table.js";
import { Button } from "../../../shared/components/Button.js";
import { ClickableCell } from "../../../shared/components/ClickableCell.js";
import type { Indicador } from "../types.js";

interface IndicadorListProps {
  indicadores: Indicador[];
  onEdit: (indicador: Indicador) => void;
  onRemove: (id: string) => void;
}

function descricao(indicador: Indicador): string {
  if (indicador.tipo === "CONSECUTIVAS") {
    return `${indicador.quantidade} dias consecutivos`;
  }
  return `${indicador.quantidade} faltas em ${indicador.janelaDias} dias`;
}

export function IndicadorList({ indicadores, onEdit, onRemove }: IndicadorListProps) {
  return (
    <Table<Indicador>
      columns={[
        {
          key: "nome",
          header: "Nome",
          render: (indicador) => (
            <ClickableCell text={indicador.nome} onClick={() => onEdit(indicador)} />
          )
        },
        { key: "escola", header: "Escola", render: (indicador) => indicador.escola.nome },
        { key: "tipo", header: "Regra", render: descricao },
        {
          key: "acoes",
          header: "Ações",
          render: (indicador) => (
            <div className="flex justify-end gap-2">
              <Button variant="danger" size="sm" onClick={() => onRemove(indicador.id)}>
                <Trash2 className="mr-1 h-3 w-3" strokeWidth={2} />
                Remover
              </Button>
            </div>
          )
        }
      ]}
      rows={indicadores}
      rowKey={(i) => i.id}
    />
  );
}
