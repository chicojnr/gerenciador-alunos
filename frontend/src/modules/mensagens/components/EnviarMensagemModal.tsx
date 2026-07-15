import { useState } from "react";
import { Send } from "lucide-react";
import { Modal } from "../../../shared/components/Modal.js";
import { Button } from "../../../shared/components/Button.js";
import { useTemplates } from "../hooks/useTemplates.js";
import { mensagensService } from "../services/mensagens.service.js";
import type { EnviarMensagensResultado } from "../types.js";

interface EnviarMensagemModalProps {
  open: boolean;
  onClose: () => void;
  alunoIds: string[];
}

const SELECT_CLASSES =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600";

export function EnviarMensagemModal({ open, onClose, alunoIds }: EnviarMensagemModalProps) {
  const { templates, loading } = useTemplates();
  const [templateId, setTemplateId] = useState("");
  const [resultado, setResultado] = useState<EnviarMensagensResultado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!templateId) {
      return;
    }
    setError(null);
    setSending(true);
    try {
      const res = await mensagensService.enviar({ templateId, alunoIds });
      setResultado(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível registrar o envio.");
    } finally {
      setSending(false);
    }
  }

  function handleClose() {
    setTemplateId("");
    setResultado(null);
    setError(null);
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <h2 className="mb-3 text-sm font-semibold text-zinc-900">
        Enviar mensagem para {alunoIds.length} aluno{alunoIds.length === 1 ? "" : "s"}
      </h2>

      {resultado ? (
        <div className="space-y-3">
          <p className="text-sm text-zinc-700">
            <span className="font-medium text-emerald-600">{resultado.registrados}</span> mensagem
            {resultado.registrados === 1 ? "" : "s"} registrada
            {resultado.registrados === 1 ? "" : "s"} para envio.
          </p>
          {resultado.semResponsavel.length > 0 && (
            <p className="text-sm text-amber-600">
              {resultado.semResponsavel.length} aluno(s) sem responsável vinculado, não recebeu
              mensagem: {resultado.semResponsavel.map((a) => a.nome).join(", ")}
            </p>
          )}
          {resultado.semTelefone.length > 0 && (
            <p className="text-sm text-amber-600">
              {resultado.semTelefone.length} responsável(is) sem telefone cadastrado, não recebeu
              mensagem:{" "}
              {resultado.semTelefone.map((r) => `${r.responsavel} (${r.nome})`).join(", ")}
            </p>
          )}
          <Button variant="secondary" onClick={handleClose} className="w-full">
            Fechar
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            disabled={loading}
            className={SELECT_CLASSES}
          >
            <option value="">Selecione um template</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <Button onClick={handleSend} disabled={!templateId || sending} className="w-full">
              <Send className="mr-1.5 h-4 w-4" strokeWidth={2.25} />
              {sending ? "Enviando..." : "Enviar"}
            </Button>
            <Button variant="secondary" onClick={handleClose} className="w-full">
              Cancelar
            </Button>
          </div>
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
