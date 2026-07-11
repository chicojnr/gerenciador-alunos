import { Pencil, Trash2 } from "lucide-react";
import { Table } from "../../../shared/components/Table.js";
import { Button } from "../../../shared/components/Button.js";
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
        { key: "nome", header: "Nome" },
        { key: "telefone", header: "Telefone", render: (r) => r.telefone ?? "—" },
        {
          key: "acoes",
          header: "Ações",
          render: (responsavel) => (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onEdit(responsavel)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
                Editar
              </Button>
              <Button variant="danger" onClick={() => onRemove(responsavel.id)}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
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
