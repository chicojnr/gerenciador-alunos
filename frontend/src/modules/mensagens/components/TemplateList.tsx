import { Pencil, Trash2 } from "lucide-react";
import { Table } from "../../../shared/components/Table.js";
import { Button } from "../../../shared/components/Button.js";
import type { Template } from "../types.js";

interface TemplateListProps {
  templates: Template[];
  onEdit: (template: Template) => void;
  onRemove: (id: string) => void;
}

export function TemplateList({ templates, onEdit, onRemove }: TemplateListProps) {
  return (
    <Table<Template>
      columns={[
        { key: "nome", header: "Nome" },
        {
          key: "conteudo",
          header: "Conteúdo",
          render: (t) => (t.conteudo.length > 60 ? `${t.conteudo.slice(0, 60)}…` : t.conteudo)
        },
        {
          key: "acoes",
          header: "Ações",
          render: (template) => (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onEdit(template)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
                Editar
              </Button>
              <Button variant="danger" onClick={() => onRemove(template.id)}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
                Remover
              </Button>
            </div>
          )
        }
      ]}
      rows={templates}
      rowKey={(t) => t.id}
    />
  );
}
