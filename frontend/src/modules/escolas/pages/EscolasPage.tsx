import { useState } from "react";
import { Building2, Plus } from "lucide-react";
import { useEscolas } from "../hooks/useEscolas.js";
import { EscolaForm } from "../components/EscolaForm.js";
import { EscolaList } from "../components/EscolaList.js";
import { Modal } from "../../../shared/components/Modal.js";
import { Button } from "../../../shared/components/Button.js";
import type { Escola, CreateEscolaInput } from "../types.js";

export function EscolasPage() {
  const { escolas, loading, create, update, remove } = useEscolas();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Escola | null>(null);

  if (loading) {
    return <p className="text-zinc-500">Carregando...</p>;
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(escola: Escola) {
    setEditing(escola);
    setModalOpen(true);
  }

  async function handleSubmit(data: CreateEscolaInput) {
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
          <Building2 className="h-5 w-5 text-zinc-400" strokeWidth={2} />
          <h1 className="text-xl font-semibold text-zinc-900">Escolas</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" strokeWidth={2.25} />
          Nova Escola
        </Button>
      </div>
      <EscolaList escolas={escolas} onEdit={openEdit} onRemove={remove} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <EscolaForm
          initial={editing ? { nome: editing.nome } : undefined}
          submitLabel={editing ? "Salvar" : "Adicionar"}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}
