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
                Editar
              </Button>
              <Button variant="danger" onClick={() => onRemove(materia.id)}>
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
