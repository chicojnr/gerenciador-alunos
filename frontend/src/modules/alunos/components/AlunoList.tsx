import { Trash2 } from "lucide-react";
import { Table } from "../../../shared/components/Table.js";
import { Button } from "../../../shared/components/Button.js";
import { ClickableCell } from "../../../shared/components/ClickableCell.js";
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
        {
          key: "nome",
          header: "Nome",
          render: (aluno) => <ClickableCell text={aluno.nome} onClick={() => onEdit(aluno)} />
        },
        { key: "turma", header: "Turma", render: (aluno) => aluno.turma.nome },
        { key: "situacaoAtual", header: "Situação", render: (aluno) => aluno.situacaoAtual.nome },
        {
          key: "acoes",
          header: "Ações",
          render: (aluno) => (
            <div className="flex justify-end gap-2">
              <Button variant="danger" size="sm" onClick={() => onRemove(aluno.id)}>
                <Trash2 className="mr-1 h-3 w-3" strokeWidth={2} />
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
