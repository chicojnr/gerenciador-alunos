import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../shared/components/Modal.js";
import { Button } from "../shared/components/Button.js";
import { onAuthExpired } from "./authExpired.js";
import { useAuth } from "./AuthContext.js";

export function AuthExpiredModal() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { clearSession } = useAuth();

  useEffect(() => onAuthExpired(() => setOpen(true)), []);

  function handleOk() {
    setOpen(false);
    clearSession();
    navigate("/login", { replace: true });
  }

  return (
    <Modal open={open} onClose={handleOk}>
      <h2 className="mb-2 text-sm font-semibold text-zinc-900">Sessão expirada</h2>
      <p className="mb-4 text-sm text-zinc-600">
        Sua sessão expirou ou você não está autenticado. Você será direcionado para o login.
      </p>
      <div className="flex justify-end">
        <Button onClick={handleOk}>OK</Button>
      </div>
    </Modal>
  );
}
