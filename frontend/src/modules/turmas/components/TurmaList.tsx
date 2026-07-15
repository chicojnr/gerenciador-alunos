import { Trash2 } from "lucide-react";
import { Table } from "../../../shared/components/Table.js";
import { Button } from "../../../shared/components/Button.js";
import { ClickableCell } from "../../../shared/components/ClickableCell.js";
import type { Turma } from "../types.js";

interface TurmaListProps {
  turmas: Turma[];
  onEdit: (turma: Turma) => void;
  onRemove: (id: string) => void;
}

export function TurmaList({ turmas, onEdit, onRemove }: TurmaListProps) {
  return (
    <Table<Turma>
      columns={[
        {
          key: "nome",
          header: "Nome",
          render: (turma) => <ClickableCell text={turma.nome} onClick={() => onEdit(turma)} />
        },
        { key: "serie", header: "Série" },
        { key: "escola", header: "Escola", render: (turma) => turma.escola.nome },
        { key: "periodo", header: "Período", render: (turma) => turma.periodo.nome },
        {
          key: "acoes",
          header: "Ações",
          render: (turma) => (
            <div className="flex justify-end gap-2">
              <Button variant="danger" size="sm" onClick={() => onRemove(turma.id)}>
                <Trash2 className="mr-1 h-3 w-3" strokeWidth={2} />
                Remover
              </Button>
            </div>
          )
        }
      ]}
      rows={turmas}
      rowKey={(t) => t.id}
    />
  );
}
