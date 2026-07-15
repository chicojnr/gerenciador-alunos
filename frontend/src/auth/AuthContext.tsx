import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authService } from "./auth.service.js";
import type { Role } from "./auth.service.js";

interface AuthUser {
  id: string;
  role: Role;
  email: string;
  name: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthUser(result: { userId: string; role: Role; email: string; name: string }): AuthUser {
  return { id: result.userId, role: result.role, email: result.email, name: result.name };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    authService
      .me()
      .then((result) => {
        if (!cancelled) {
          setUser(toAuthUser(result));
        }
      })
      .catch(() => {
        // Not logged in (401) — expected when there's no valid session yet.
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function login(email: string, password: string) {
    const result = await authService.login(email, password);
    setUser(toAuthUser(result));
  }

  async function logout() {
    await authService.logout();
    setUser(null);
  }

  function clearSession() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, clearSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
