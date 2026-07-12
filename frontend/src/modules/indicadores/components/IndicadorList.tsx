import { Pencil, Trash2 } from "lucide-react";
import { Table } from "../../../shared/components/Table.js";
import { Button } from "../../../shared/components/Button.js";
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
        { key: "nome", header: "Nome" },
        { key: "tipo", header: "Regra", render: descricao },
        {
          key: "acoes",
          header: "Ações",
          render: (indicador) => (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onEdit(indicador)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
                Editar
              </Button>
              <Button variant="danger" onClick={() => onRemove(indicador.id)}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
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
