import { useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import { useCalendariosLetivos } from "../hooks/useCalendariosLetivos.js";
import { CalendarioLetivoForm } from "../components/CalendarioLetivoForm.js";
import { CalendarioLetivoList } from "../components/CalendarioLetivoList.js";
import { Modal } from "../../../shared/components/Modal.js";
import { Button } from "../../../shared/components/Button.js";
import { useConfirm } from "../../../shared/contexts/ConfirmContext.js";
import type { CalendarioLetivo, CreateCalendarioLetivoInput } from "../types.js";

export function CalendariosLetivosPage() {
  const { calendarios, loading, create, update, remove } = useCalendariosLetivos();
  const confirm = useConfirm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarioLetivo | null>(null);

  if (loading) {
    return <p className="text-zinc-500">Carregando...</p>;
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(calendario: CalendarioLetivo) {
    setEditing(calendario);
    setModalOpen(true);
  }

  async function handleSubmit(data: CreateCalendarioLetivoInput) {
    if (editing) {
      const ok = await confirm({
        title: "Salvar alterações",
        message: "Confirma a alteração deste calendário letivo?",
        confirmLabel: "Salvar"
      });
      if (!ok) {
        return;
      }
      await update(editing.id, data);
    } else {
      await create(data);
    }
    setModalOpen(false);
  }

  async function handleRemove(id: string) {
    const ok = await confirm({
      title: "Remover calendário letivo",
      message: "Tem certeza que deseja remover este calendário letivo?",
      confirmLabel: "Remover",
      variant: "danger"
    });
    if (ok) {
      await remove(id);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <CalendarDays className="h-5 w-5 text-zinc-400" strokeWidth={2} />
          <h1 className="text-xl font-semibold text-zinc-900">Calendário Letivo</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" strokeWidth={2.25} />
          Novo Calendário
        </Button>
      </div>
      <CalendarioLetivoList calendarios={calendarios} onEdit={openEdit} onRemove={handleRemove} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <CalendarioLetivoForm
          initial={
            editing
              ? {
                  nome: editing.nome,
                  dataInicio: editing.dataInicio,
                  dataFim: editing.dataFim,
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
