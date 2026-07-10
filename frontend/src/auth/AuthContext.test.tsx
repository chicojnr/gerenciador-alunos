import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext.js";

function Probe() {
  const { user, login } = useAuth();
  return (
    <div>
      <span>{user ? `logged-in:${user.id}` : "logged-out"}</span>
      <button onClick={() => login("a@b.com", "pw")}>login</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ userId: "u1", role: "USER" }), { status: 200 }))
    );
  });

  it("starts logged out and updates after login()", async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    expect(screen.getByText("logged-out")).toBeTruthy();
    fireEvent.click(screen.getByText("login"));

    await waitFor(() => expect(screen.getByText("logged-in:u1")).toBeTruthy());
  });

  it("rehydrates the user from /auth/me on mount, without calling login()", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = typeof input === "string" ? input : input.toString();
        if (url.includes("/auth/me")) {
          return new Response(JSON.stringify({ userId: "u2", role: "USER" }), { status: 200 });
        }
        throw new Error(`Unexpected fetch call: ${url}`);
      })
    );

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText("logged-in:u2")).toBeTruthy());
  });

  it("stays logged out when /auth/me responds 401, and clears loading", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }))
    );

    function LoadingProbe() {
      const { user, loading } = useAuth();
      return <span>{loading ? "loading" : user ? `logged-in:${user.id}` : "logged-out"}</span>;
    }

    render(
      <AuthProvider>
        <LoadingProbe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText("logged-out")).toBeTruthy());
  });
});
