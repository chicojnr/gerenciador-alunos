import { useState } from "react";
import { Layers, Plus } from "lucide-react";
import { useTurmas } from "../hooks/useTurmas.js";
import { TurmaForm } from "../components/TurmaForm.js";
import { TurmaList } from "../components/TurmaList.js";
import { TurmaMateriaPanel } from "../../turma-materias/components/TurmaMateriaPanel.js";
import { Modal } from "../../../shared/components/Modal.js";
import { Button } from "../../../shared/components/Button.js";
import type { Turma, CreateTurmaInput } from "../types.js";

export function TurmasPage() {
  const { turmas, loading, create, update, remove } = useTurmas();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Turma | null>(null);

  if (loading) {
    return <p className="text-zinc-500">Carregando...</p>;
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(turma: Turma) {
    setEditing(turma);
    setModalOpen(true);
  }

  async function handleSubmit(data: CreateTurmaInput) {
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
          <Layers className="h-5 w-5 text-zinc-400" strokeWidth={2} />
          <h1 className="text-xl font-semibold text-zinc-900">Turmas</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" strokeWidth={2.25} />
          Nova Turma
        </Button>
      </div>
      <TurmaList turmas={turmas} onEdit={openEdit} onRemove={remove} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <TurmaForm
          initial={
            editing
              ? {
                  nome: editing.nome,
                  serie: editing.serie,
                  escolaId: editing.escola.id,
                  periodoId: editing.periodo.id
                }
              : undefined
          }
          submitLabel={editing ? "Salvar" : "Adicionar"}
          onSubmit={handleSubmit}
        />
        {editing && <TurmaMateriaPanel turmaId={editing.id} />}
      </Modal>
    </div>
  );
}
