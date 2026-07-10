import { describe, it, expect } from "vitest";
import { signAccessToken, verifyToken } from "./jwt.js";

describe("jwt", () => {
  it("signs and verifies an access token", () => {
    const token = signAccessToken("user-123", "test-secret");
    const payload = verifyToken(token, "test-secret");
    expect(payload.userId).toBe("user-123");
  });

  it("throws on wrong secret", () => {
    const token = signAccessToken("user-123", "test-secret");
    expect(() => verifyToken(token, "other-secret")).toThrow();
  });
});
