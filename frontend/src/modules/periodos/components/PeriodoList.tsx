import { Trash2 } from "lucide-react";
import { Table } from "../../../shared/components/Table.js";
import { Button } from "../../../shared/components/Button.js";
import { ClickableCell } from "../../../shared/components/ClickableCell.js";
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
        {
          key: "nome",
          header: "Nome",
          render: (periodo) => <ClickableCell text={periodo.nome} onClick={() => onEdit(periodo)} />
        },
        {
          key: "acoes",
          header: "Ações",
          render: (periodo) => (
            <div className="flex justify-end gap-2">
              <Button variant="danger" size="sm" onClick={() => onRemove(periodo.id)}>
                <Trash2 className="mr-1 h-3 w-3" strokeWidth={2} />
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
