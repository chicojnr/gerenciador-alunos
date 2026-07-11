import { Pencil, Trash2 } from "lucide-react";
import { Table } from "../../../shared/components/Table.js";
import { Button } from "../../../shared/components/Button.js";
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
        { key: "nome", header: "Nome" },
        { key: "serie", header: "Série" },
        { key: "escola", header: "Escola", render: (turma) => turma.escola.nome },
        { key: "periodo", header: "Período", render: (turma) => turma.periodo.nome },
        {
          key: "acoes",
          header: "Ações",
          render: (turma) => (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onEdit(turma)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
                Editar
              </Button>
              <Button variant="danger" onClick={() => onRemove(turma.id)}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
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
