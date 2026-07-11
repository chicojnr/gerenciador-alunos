import { Pencil, Trash2 } from "lucide-react";
import { Table } from "../../../shared/components/Table.js";
import { Button } from "../../../shared/components/Button.js";
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
        { key: "nome", header: "Nome" },
        { key: "escola", header: "Escola", render: (professor) => professor.escola.nome },
        {
          key: "acoes",
          header: "Ações",
          render: (professor) => (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onEdit(professor)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
                Editar
              </Button>
              <Button variant="danger" onClick={() => onRemove(professor.id)}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
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
