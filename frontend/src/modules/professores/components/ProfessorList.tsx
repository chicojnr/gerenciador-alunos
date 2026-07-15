import { Trash2 } from "lucide-react";
import { Table } from "../../../shared/components/Table.js";
import { Button } from "../../../shared/components/Button.js";
import { ClickableCell } from "../../../shared/components/ClickableCell.js";
import type { Professor } from "../types.js";

interface ProfessorListProps {
  professores: Professor[];
  onEdit: (professor: Professor) => void;
  onRemove: (id: string) => void;
}

export function ProfessorList({ professores, onEdit, onRemove }: ProfessorListProps) {
  return (
    <Table<Professor>
      columns={[
        {
          key: "nome",
          header: "Nome",
          render: (professor) => (
            <ClickableCell text={professor.nome} onClick={() => onEdit(professor)} />
          )
        },
        { key: "escola", header: "Escola", render: (professor) => professor.escola.nome },
        {
          key: "acoes",
          header: "Ações",
          render: (professor) => (
            <div className="flex justify-end gap-2">
              <Button variant="danger" size="sm" onClick={() => onRemove(professor.id)}>
                <Trash2 className="mr-1 h-3 w-3" strokeWidth={2} />
                Remover
              </Button>
            </div>
          )
        }
      ]}
      rows={professores}
      rowKey={(p) => p.id}
    />
  );
}
