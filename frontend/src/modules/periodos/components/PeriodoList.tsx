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
                Editar
              </Button>
              <Button variant="danger" onClick={() => onRemove(periodo.id)}>
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
