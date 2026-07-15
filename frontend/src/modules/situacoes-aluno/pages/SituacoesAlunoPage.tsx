import { useState } from "react";
import { Repeat2, Plus } from "lucide-react";
import { useSituacoesAluno } from "../hooks/useSituacoesAluno.js";
import { SituacaoAlunoForm } from "../components/SituacaoAlunoForm.js";
import { SituacaoAlunoList } from "../components/SituacaoAlunoList.js";
import { Modal } from "../../../shared/components/Modal.js";
import { Button } from "../../../shared/components/Button.js";
import { useConfirm } from "../../../shared/contexts/ConfirmContext.js";
import type { SituacaoAluno, CreateSituacaoAlunoInput } from "../types.js";

export function SituacoesAlunoPage() {
  const { situacoes, loading, create, update, remove } = useSituacoesAluno();
  const confirm = useConfirm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SituacaoAluno | null>(null);

  if (loading) {
    return <p className="text-zinc-500">Carregando...</p>;
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(situacao: SituacaoAluno) {
    setEditing(situacao);
    setModalOpen(true);
  }

  async function handleSubmit(data: CreateSituacaoAlunoInput) {
    if (editing) {
      const ok = await confirm({
        title: "Salvar alterações",
        message: "Confirma a alteração desta situação?",
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
      title: "Remover situação",
      message: "Tem certeza que deseja remover esta situação?",
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
          <Repeat2 className="h-5 w-5 text-zinc-400" strokeWidth={2} />
          <h1 className="text-xl font-semibold text-zinc-900">Situações</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" strokeWidth={2.25} />
          Nova Situação
        </Button>
      </div>
      <SituacaoAlunoList situacoes={situacoes} onEdit={openEdit} onRemove={handleRemove} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <SituacaoAlunoForm
          initial={editing ? { nome: editing.nome } : undefined}
          submitLabel={editing ? "Salvar" : "Adicionar"}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
