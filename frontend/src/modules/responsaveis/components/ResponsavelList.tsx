import { Trash2 } from "lucide-react";
import { Table } from "../../../shared/components/Table.js";
import { Button } from "../../../shared/components/Button.js";
import { ClickableCell } from "../../../shared/components/ClickableCell.js";
import type { Responsavel } from "../types.js";

interface ResponsavelListProps {
  responsaveis: Responsavel[];
  onEdit: (responsavel: Responsavel) => void;
  onRemove: (id: string) => void;
}

export function ResponsavelList({ responsaveis, onEdit, onRemove }: ResponsavelListProps) {
  return (
    <Table<Responsavel>
      columns={[
        {
          key: "nome",
          header: "Nome",
          render: (r) => <ClickableCell text={r.nome} onClick={() => onEdit(r)} />
        },
        { key: "telefone", header: "Telefone", render: (r) => r.telefone ?? "—" },
        {
          key: "acoes",
          header: "Ações",
          render: (responsavel) => (
            <div className="flex justify-end gap-2">
              <Button variant="danger" size="sm" onClick={() => onRemove(responsavel.id)}>
                <Trash2 className="mr-1 h-3 w-3" strokeWidth={2} />
                Remover
              </Button>
            </div>
          )
        }
      ]}
      rows={responsaveis}
      rowKey={(r) => r.id}
    />
  );
}
