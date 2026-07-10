import { Table } from "../../../shared/components/Table.js";
import { Button } from "../../../shared/components/Button.js";
import type { Escola } from "../types.js";

interface EscolaListProps {
  escolas: Escola[];
  onEdit: (escola: Escola) => void;
  onRemove: (id: string) => void;
}

export function EscolaList({ escolas, onEdit, onRemove }: EscolaListProps) {
  return (
    <Table<Escola>
      columns={[
        { key: "nome", header: "Nome" },
        {
          key: "acoes",
          header: "Ações",
          render: (escola) => (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onEdit(escola)}>
                Editar
              </Button>
              <Button variant="danger" onClick={() => onRemove(escola.id)}>
                Remover
              </Button>
            </div>
          )
        }
      ]}
      rows={escolas}
      rowKey={(e) => e.id}
    />
  );
}
