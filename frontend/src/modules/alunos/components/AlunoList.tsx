import { Pencil, Trash2 } from "lucide-react";
import { Table } from "../../../shared/components/Table.js";
import { Button } from "../../../shared/components/Button.js";
import type { Aluno } from "../types.js";

interface AlunoListProps {
  alunos: Aluno[];
  onEdit: (aluno: Aluno) => void;
  onRemove: (id: string) => void;
}

export function AlunoList({ alunos, onEdit, onRemove }: AlunoListProps) {
  return (
    <Table<Aluno>
      columns={[
        { key: "nome", header: "Nome" },
        { key: "turma", header: "Turma", render: (aluno) => aluno.turma.nome },
        { key: "situacaoAtual", header: "Situação", render: (aluno) => aluno.situacaoAtual.nome },
        {
          key: "acoes",
          header: "Ações",
          render: (aluno) => (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onEdit(aluno)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
                Editar
              </Button>
              <Button variant="danger" onClick={() => onRemove(aluno.id)}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
                Remover
              </Button>
            </div>
          )
        }
      ]}
      rows={alunos}
      rowKey={(a) => a.id}
    />
  );
}
