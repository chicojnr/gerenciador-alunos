import { useState } from "react";
import { UserRound, Plus } from "lucide-react";
import { useProfessores } from "../hooks/useProfessores.js";
import { ProfessorForm } from "../components/ProfessorForm.js";
import { ProfessorList } from "../components/ProfessorList.js";
import { Modal } from "../../../shared/components/Modal.js";
import { Button } from "../../../shared/components/Button.js";
import type { Professor, CreateProfessorInput } from "../types.js";

export function ProfessoresPage() {
  const { professores, loading, create, update, remove } = useProfessores();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Professor | null>(null);

  if (loading) {
    return <p className="text-zinc-500">Carregando...</p>;
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(professor: Professor) {
    setEditing(professor);
    setModalOpen(true);
  }

  async function handleSubmit(data: CreateProfessorInput) {
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
          <UserRound className="h-5 w-5 text-zinc-400" strokeWidth={2} />
          <h1 className="text-xl font-semibold text-zinc-900">Professores</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" strokeWidth={2.25} />
          Novo Professor
        </Button>
      </div>
      <ProfessorList professores={professores} onEdit={openEdit} onRemove={remove} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ProfessorForm
          initial={
            editing
              ? {
                  nome: editing.nome,
                  email: editing.email ?? undefined,
                  telefone: editing.telefone ?? undefined,
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
