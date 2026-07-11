import { useState } from "react";
import { Contact, Plus } from "lucide-react";
import { useResponsaveis } from "../hooks/useResponsaveis.js";
import { ResponsavelForm } from "../components/ResponsavelForm.js";
import { ResponsavelList } from "../components/ResponsavelList.js";
import { Modal } from "../../../shared/components/Modal.js";
import { Button } from "../../../shared/components/Button.js";
import type { Responsavel, CreateResponsavelInput } from "../types.js";

export function ResponsaveisPage() {
  const { responsaveis, loading, create, update, remove } = useResponsaveis();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Responsavel | null>(null);

  if (loading) {
    return <p className="text-zinc-500">Carregando...</p>;
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(responsavel: Responsavel) {
    setEditing(responsavel);
    setModalOpen(true);
  }

  async function handleSubmit(data: CreateResponsavelInput) {
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
          <Contact className="h-5 w-5 text-zinc-400" strokeWidth={2} />
          <h1 className="text-xl font-semibold text-zinc-900">Pais/Responsáveis</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" strokeWidth={2.25} />
          Novo Responsável
        </Button>
      </div>
      <ResponsavelList responsaveis={responsaveis} onEdit={openEdit} onRemove={remove} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ResponsavelForm
          initial={
            editing
              ? {
                  nome: editing.nome,
                  telefone: editing.telefone ?? undefined,
                  email: editing.email ?? undefined
                }
              : undefined
          }
          submitLabel={editing ? "Salvar" : "Adicionar"}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}
