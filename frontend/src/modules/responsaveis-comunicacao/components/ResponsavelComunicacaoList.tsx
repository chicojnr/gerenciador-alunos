import { Pencil, Trash2 } from "lucide-react";
import { Table } from "../../../shared/components/Table.js";
import { Button } from "../../../shared/components/Button.js";
import type { ResponsavelComunicacao } from "../types.js";

interface ResponsavelComunicacaoListProps {
  items: ResponsavelComunicacao[];
  onEdit: (item: ResponsavelComunicacao) => void;
  onRemove: (id: string) => void;
}

export function ResponsavelComunicacaoList({
  items,
  onEdit,
  onRemove
}: ResponsavelComunicacaoListProps) {
  return (
    <Table<ResponsavelComunicacao>
      columns={[
        { key: "nome", header: "Nome" },
        { key: "escola", header: "Escola", render: (item) => item.escola.nome },
        {
          key: "acoes",
          header: "Ações",
          render: (item) => (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onEdit(item)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
                Editar
              </Button>
              <Button variant="danger" onClick={() => onRemove(item.id)}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
                Remover
              </Button>
            </div>
          )
        }
      ]}
      rows={items}
      rowKey={(i) => i.id}
    />
  );
}
