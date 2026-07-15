import { Trash2 } from "lucide-react";
import { Table } from "../../../shared/components/Table.js";
import { Button } from "../../../shared/components/Button.js";
import { ClickableCell } from "../../../shared/components/ClickableCell.js";
import type { CalendarioLetivo } from "../types.js";

interface CalendarioLetivoListProps {
  calendarios: CalendarioLetivo[];
  onEdit: (calendario: CalendarioLetivo) => void;
  onRemove: (id: string) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function CalendarioLetivoList({ calendarios, onEdit, onRemove }: CalendarioLetivoListProps) {
  return (
    <Table<CalendarioLetivo>
      columns={[
        {
          key: "nome",
          header: "Nome",
          render: (c) => <ClickableCell text={c.nome} onClick={() => onEdit(c)} />
        },
        { key: "escola", header: "Escola", render: (c) => c.escola.nome },
        { key: "dataInicio", header: "Início", render: (c) => formatDate(c.dataInicio) },
        { key: "dataFim", header: "Fim", render: (c) => formatDate(c.dataFim) },
        {
          key: "acoes",
          header: "Ações",
          render: (calendario) => (
            <div className="flex justify-end gap-2">
              <Button variant="danger" size="sm" onClick={() => onRemove(calendario.id)}>
                <Trash2 className="mr-1 h-3 w-3" strokeWidth={2} />
                Remover
              </Button>
            </div>
          )
        }
      ]}
      rows={calendarios}
      rowKey={(c) => c.id}
    />
  );
}
