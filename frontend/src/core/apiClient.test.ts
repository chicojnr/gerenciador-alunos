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
});
