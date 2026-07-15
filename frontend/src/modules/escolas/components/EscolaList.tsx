import { Trash2 } from "lucide-react";
import { Table } from "../../../shared/components/Table.js";
import { Button } from "../../../shared/components/Button.js";
import { ClickableCell } from "../../../shared/components/ClickableCell.js";
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
        {
          key: "nome",
          header: "Nome",
          render: (escola) => <ClickableCell text={escola.nome} onClick={() => onEdit(escola)} />
        },
        {
          key: "acoes",
          header: "Ações",
          render: (escola) => (
            <div className="flex justify-end gap-2">
              <Button variant="danger" size="sm" onClick={() => onRemove(escola.id)}>
                <Trash2 className="mr-1 h-3 w-3" strokeWidth={2} />
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
