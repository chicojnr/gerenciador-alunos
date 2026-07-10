import { describe, it, expect } from "vitest";
import { signAccessToken, verifyToken } from "./jwt.js";

describe("jwt", () => {
  it("signs and verifies an access token, including its role", () => {
    const token = signAccessToken("user-123", "ADMIN", "test-secret");
    const payload = verifyToken(token, "test-secret");
    expect(payload.userId).toBe("user-123");
    expect(payload.role).toBe("ADMIN");
  });

  it("throws on wrong secret", () => {
    const token = signAccessToken("user-123", "ADMIN", "test-secret");
    expect(() => verifyToken(token, "other-secret")).toThrow();
  });
});
