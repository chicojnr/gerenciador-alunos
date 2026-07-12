import { useState } from "react";
import { FileText, Plus } from "lucide-react";
import { useTemplates } from "../hooks/useTemplates.js";
import { TemplateForm } from "../components/TemplateForm.js";
import { TemplateList } from "../components/TemplateList.js";
import { Modal } from "../../../shared/components/Modal.js";
import { Button } from "../../../shared/components/Button.js";
import type { Template, CreateTemplateInput } from "../types.js";

export function TemplatesPage() {
  const { templates, loading, error, create, update, remove } = useTemplates();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);

  if (loading) {
    return <p className="text-zinc-500">Carregando...</p>;
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-red-600">
        {error}
      </p>
    );
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(template: Template) {
    setEditing(template);
    setModalOpen(true);
  }

  async function handleSubmit(data: CreateTemplateInput) {
    if (editing) {
      await update(editing.id, data);
    } else {
      await create(data);
    }
    setModalOpen(false);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <FileText className="h-5 w-5 text-zinc-400" strokeWidth={2} />
          <h1 className="text-xl font-semibold text-zinc-900">Templates de Mensagem</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" strokeWidth={2.25} />
          Novo Template
        </Button>
      </div>
      <TemplateList templates={templates} onEdit={openEdit} onRemove={remove} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <TemplateForm
          initial={editing ? { nome: editing.nome, conteudo: editing.conteudo } : undefined}
          submitLabel={editing ? "Salvar" : "Adicionar"}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}
