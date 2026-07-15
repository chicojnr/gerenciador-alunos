import { Trash2 } from "lucide-react";
import { Table } from "../../../shared/components/Table.js";
import { Button } from "../../../shared/components/Button.js";
import { ClickableCell } from "../../../shared/components/ClickableCell.js";
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
        {
          key: "codigo",
          header: "Código",
          render: (materia) => (
            <ClickableCell text={materia.codigo ?? ""} onClick={() => onEdit(materia)} />
          )
        },
        {
          key: "nome",
          header: "Disciplina",
          render: (materia) => <ClickableCell text={materia.nome} onClick={() => onEdit(materia)} />
        },
        {
          key: "acoes",
          header: "Ações",
          render: (materia) => (
            <div className="flex justify-end gap-2">
              <Button variant="danger" size="sm" onClick={() => onRemove(materia.id)}>
                <Trash2 className="mr-1 h-3 w-3" strokeWidth={2} />
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
