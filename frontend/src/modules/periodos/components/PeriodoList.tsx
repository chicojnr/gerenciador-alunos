import { Pencil, Trash2 } from "lucide-react";
import { Table } from "../../../shared/components/Table.js";
import { Button } from "../../../shared/components/Button.js";
import type { Periodo } from "../types.js";

interface PeriodoListProps {
  periodos: Periodo[];
  onEdit: (periodo: Periodo) => void;
  onRemove: (id: string) => void;
}

export function PeriodoList({ periodos, onEdit, onRemove }: PeriodoListProps) {
  return (
    <Table<Periodo>
      columns={[
        { key: "nome", header: "Nome" },
        {
          key: "acoes",
          header: "Ações",
          render: (periodo) => (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onEdit(periodo)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
                Editar
              </Button>
              <Button variant="danger" onClick={() => onRemove(periodo.id)}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
                Remover
              </Button>
            </div>
          )
        }
      ]}
      rows={periodos}
      rowKey={(p) => p.id}
    />
  );
}
