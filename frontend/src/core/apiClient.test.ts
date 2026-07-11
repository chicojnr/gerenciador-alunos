import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "./apiClient.js";

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
});
