import { useState, FormEvent } from "react";
import { Button } from "../../../shared/components/Button.js";
import type { CreateTemplateInput } from "../types.js";

interface TemplateFormProps {
  initial?: CreateTemplateInput;
  submitLabel: string;
  onSubmit: (data: CreateTemplateInput) => Promise<void>;
}

const INPUT_CLASSES =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600";

export function TemplateForm({ initial, submitLabel, onSubmit }: TemplateFormProps) {
  const [nome, setNome] = useState(initial?.nome ?? "");
  const [conteudo, setConteudo] = useState(initial?.conteudo ?? "");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({ nome, conteudo });
      if (!initial) {
        setNome("");
        setConteudo("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar o template.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome do template"
        className={INPUT_CLASSES}
      />
      <textarea
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
        placeholder="Use {aluno} e {responsavel} como variáveis"
        rows={4}
        className={INPUT_CLASSES}
      />
      <p className="text-xs text-zinc-400">
        Variáveis disponíveis: <code>{"{aluno}"}</code> e <code>{"{responsavel}"}</code>
      </p>
      <Button type="submit">{submitLabel}</Button>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
