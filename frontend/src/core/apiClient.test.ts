import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "./apiClient.js";
import { onAuthExpired } from "../auth/authExpired.js";

describe("apiClient", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }))
    );
  });

  it("performs a GET with credentials included", async () => {
    const result = await apiClient.get<{ ok: boolean }>("/health");
    expect(result).toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/health"),
      expect.objectContaining({ credentials: "include", method: "GET" })
    );
  });

  it("throws the backend's error message on a non-2xx JSON response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () => new Response(JSON.stringify({ error: "email already in use" }), { status: 400 })
      )
    );

    await expect(apiClient.post("/usuarios", {})).rejects.toThrow("email already in use");
  });

  it("falls back to a generic message when the error response has no body", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 500 })));

    await expect(apiClient.post("/usuarios", {})).rejects.toThrow("Request failed: 500");
  });

  it("triggers the auth-expired listener when a request fails with 401 after a failed refresh", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401 }))
    );
    const listener = vi.fn();
    const unsubscribe = onAuthExpired(listener);

    await expect(apiClient.get("/materias")).rejects.toThrow("Não autenticado");
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it("retries and succeeds after a 401 when the refresh call succeeds", async () => {
    const calls: { url: string; init?: RequestInit }[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        calls.push({ url, init });
        if (url.includes("/auth/refresh")) {
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }
        if (calls.filter((c) => c.url === url).length === 1) {
          return new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401 });
        }
        return new Response(JSON.stringify({ items: [] }), { status: 200 });
      })
    );

    const result = await apiClient.get<{ items: unknown[] }>("/materias");
    expect(result).toEqual({ items: [] });

    const refreshCall = calls.find((c) => c.url.includes("/auth/refresh"));
    expect(refreshCall).toBeDefined();
    // Regression: a JSON content-type with no body makes Fastify reject the
    // request with 400 before it reaches the route handler (FST_ERR_CTP_EMPTY_JSON_BODY).
    expect((refreshCall!.init?.headers as Record<string, string> | undefined)?.["Content-Type"]).toBeUndefined();
  });

  it("does not trigger the auth-expired listener for the login endpoint itself", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ error: "credenciais inválidas" }), { status: 401 }))
    );
    const listener = vi.fn();
    const unsubscribe = onAuthExpired(listener);

    await expect(apiClient.post("/auth/login", {})).rejects.toThrow("credenciais inválidas");
    expect(listener).not.toHaveBeenCalled();

    unsubscribe();
  });
});
