import { useState, FormEvent } from "react";
import { Button } from "../../../shared/components/Button.js";
import { useEscolaOptions } from "../../../shared/hooks/useEscolaOptions.js";
import type { CreateResponsavelComunicacaoInput } from "../types.js";

interface ResponsavelComunicacaoFormProps {
  initial?: CreateResponsavelComunicacaoInput;
  submitLabel: string;
  onSubmit: (data: CreateResponsavelComunicacaoInput) => Promise<void>;
}

const INPUT_CLASSES =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600";

export function ResponsavelComunicacaoForm({
  initial,
  submitLabel,
  onSubmit
}: ResponsavelComunicacaoFormProps) {
  const { escolas, loading: loadingEscolas } = useEscolaOptions();
  const [nome, setNome] = useState(initial?.nome ?? "");
  const [telefone, setTelefone] = useState(initial?.telefone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [escolaId, setEscolaId] = useState(initial?.escolaId ?? "");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({ nome, telefone: telefone || undefined, email: email || undefined, escolaId });
      if (!initial) {
        setNome("");
        setTelefone("");
        setEmail("");
        setEscolaId("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome"
        className={INPUT_CLASSES}
      />
      <input
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        placeholder="Telefone (opcional)"
        className={INPUT_CLASSES}
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email (opcional)"
        className={INPUT_CLASSES}
      />
      <select
        value={escolaId}
        onChange={(e) => setEscolaId(e.target.value)}
        disabled={loadingEscolas}
        className={INPUT_CLASSES}
      >
        <option value="">Selecione uma escola</option>
        {escolas.map((escola) => (
          <option key={escola.id} value={escola.id}>
            {escola.nome}
          </option>
        ))}
      </select>
      <Button type="submit">{submitLabel}</Button>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
