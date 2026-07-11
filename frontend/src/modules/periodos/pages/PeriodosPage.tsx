import { useState } from "react";
import { Clock, Plus } from "lucide-react";
import { usePeriodos } from "../hooks/usePeriodos.js";
import { PeriodoForm } from "../components/PeriodoForm.js";
import { PeriodoList } from "../components/PeriodoList.js";
import { Modal } from "../../../shared/components/Modal.js";
import { Button } from "../../../shared/components/Button.js";
import type { Periodo, CreatePeriodoInput } from "../types.js";

export function PeriodosPage() {
  const { periodos, loading, create, update, remove } = usePeriodos();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Periodo | null>(null);

  if (loading) {
    return <p className="text-zinc-500">Carregando...</p>;
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(periodo: Periodo) {
    setEditing(periodo);
    setModalOpen(true);
  }

  async function handleSubmit(data: CreatePeriodoInput) {
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
          <Clock className="h-5 w-5 text-zinc-400" strokeWidth={2} />
          <h1 className="text-xl font-semibold text-zinc-900">Períodos</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" strokeWidth={2.25} />
          Novo Período
        </Button>
      </div>
      <PeriodoList periodos={periodos} onEdit={openEdit} onRemove={remove} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <PeriodoForm
          initial={editing ? { nome: editing.nome } : undefined}
          submitLabel={editing ? "Salvar" : "Adicionar"}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}
