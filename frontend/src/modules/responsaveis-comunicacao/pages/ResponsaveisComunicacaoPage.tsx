import { useState } from "react";
import { MessageCircle, Plus } from "lucide-react";
import { useResponsaveisComunicacao } from "../hooks/useResponsaveisComunicacao.js";
import { ResponsavelComunicacaoForm } from "../components/ResponsavelComunicacaoForm.js";
import { ResponsavelComunicacaoList } from "../components/ResponsavelComunicacaoList.js";
import { Modal } from "../../../shared/components/Modal.js";
import { Button } from "../../../shared/components/Button.js";
import type { ResponsavelComunicacao, CreateResponsavelComunicacaoInput } from "../types.js";

export function ResponsaveisComunicacaoPage() {
  const { items, loading, create, update, remove } = useResponsaveisComunicacao();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ResponsavelComunicacao | null>(null);

  if (loading) {
    return <p className="text-zinc-500">Carregando...</p>;
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(item: ResponsavelComunicacao) {
    setEditing(item);
    setModalOpen(true);
  }

  async function handleSubmit(data: CreateResponsavelComunicacaoInput) {
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
          <MessageCircle className="h-5 w-5 text-zinc-400" strokeWidth={2} />
          <h1 className="text-xl font-semibold text-zinc-900">Responsáveis por Comunicação</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" strokeWidth={2.25} />
          Novo Responsável
        </Button>
      </div>
      <ResponsavelComunicacaoList items={items} onEdit={openEdit} onRemove={remove} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ResponsavelComunicacaoForm
          initial={
            editing
              ? {
                  nome: editing.nome,
                  telefone: editing.telefone ?? undefined,
                  email: editing.email ?? undefined,
                  escolaId: editing.escola.id
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
