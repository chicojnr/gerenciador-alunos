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
      vi.fn(async () => new Response(JSON.stringify({ userId: "u1" }), { status: 200 }))
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
});
