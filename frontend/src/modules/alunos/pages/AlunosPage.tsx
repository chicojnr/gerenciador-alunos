import { useState } from "react";
import { GraduationCap as StudentIcon, Plus } from "lucide-react";
import { useAlunos } from "../hooks/useAlunos.js";
import { AlunoForm } from "../components/AlunoForm.js";
import { AlunoList } from "../components/AlunoList.js";
import { AlunoResponsavelPanel } from "../../aluno-responsaveis/components/AlunoResponsavelPanel.js";
import { AlunoSituacaoPanel } from "../../aluno-situacoes/components/AlunoSituacaoPanel.js";
import { Modal } from "../../../shared/components/Modal.js";
import { Button } from "../../../shared/components/Button.js";
import { useConfirm } from "../../../shared/contexts/ConfirmContext.js";
import type { Aluno, CreateAlunoInput } from "../types.js";

export function AlunosPage() {
  const { alunos, loading, create, update, remove, refresh } = useAlunos();
  const confirm = useConfirm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Aluno | null>(null);

  if (loading) {
    return <p className="text-zinc-500">Carregando...</p>;
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(aluno: Aluno) {
    setEditing(aluno);
    setModalOpen(true);
  }

  async function handleSubmit(data: CreateAlunoInput) {
    if (editing) {
      const ok = await confirm({
        title: "Salvar alterações",
        message: "Confirma a alteração deste aluno?",
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
      title: "Remover aluno",
      message: "Tem certeza que deseja remover este aluno?",
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
          <StudentIcon className="h-5 w-5 text-zinc-400" strokeWidth={2} />
          <h1 className="text-xl font-semibold text-zinc-900">Alunos</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" strokeWidth={2.25} />
          Novo Aluno
        </Button>
      </div>
      <AlunoList alunos={alunos} onEdit={openEdit} onRemove={handleRemove} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <AlunoForm
          initial={
            editing
              ? {
                  nome: editing.nome,
                  dataNascimento: editing.dataNascimento ?? undefined,
                  turmaId: editing.turma.id
                }
              : undefined
          }
          submitLabel={editing ? "Salvar" : "Adicionar"}
          onSubmit={handleSubmit}
        />
        {editing && <AlunoResponsavelPanel alunoId={editing.id} />}
        {editing && <AlunoSituacaoPanel alunoId={editing.id} onChanged={refresh} />}
      </Modal>
    </div>
  );
}
