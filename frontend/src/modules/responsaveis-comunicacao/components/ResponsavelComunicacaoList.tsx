import { Trash2 } from "lucide-react";
import { Table } from "../../../shared/components/Table.js";
import { Button } from "../../../shared/components/Button.js";
import { ClickableCell } from "../../../shared/components/ClickableCell.js";
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
        {
          key: "user",
          header: "Usuário",
          render: (item) => <ClickableCell text={item.user.name} onClick={() => onEdit(item)} />
        },
        { key: "email", header: "Email", render: (item) => item.user.email },
        { key: "telefone", header: "Telefone", render: (item) => item.telefone ?? "—" },
        { key: "escola", header: "Escola", render: (item) => item.escola.nome },
        {
          key: "acoes",
          header: "Ações",
          render: (item) => (
            <div className="flex justify-end gap-2">
              <Button variant="danger" size="sm" onClick={() => onRemove(item.id)}>
                <Trash2 className="mr-1 h-3 w-3" strokeWidth={2} />
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
