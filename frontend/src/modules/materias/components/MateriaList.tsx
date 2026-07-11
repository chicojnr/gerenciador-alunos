import { Pencil, Trash2 } from "lucide-react";
import { Table } from "../../../shared/components/Table.js";
import { Button } from "../../../shared/components/Button.js";
import type { Materia } from "../types.js";

interface MateriaListProps {
  materias: Materia[];
  onEdit: (materia: Materia) => void;
  onRemove: (id: string) => void;
}

export function MateriaList({ materias, onEdit, onRemove }: MateriaListProps) {
  return (
    <Table<Materia>
      columns={[
        { key: "nome", header: "Nome" },
        {
          key: "acoes",
          header: "Ações",
          render: (materia) => (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onEdit(materia)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
                Editar
              </Button>
              <Button variant="danger" onClick={() => onRemove(materia.id)}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
                Remover
              </Button>
            </div>
          )
        }
      ]}
      rows={materias}
      rowKey={(m) => m.id}
    />
  );
}
