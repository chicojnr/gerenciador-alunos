import { describe, it, expect } from "vitest";
import { hashPassword, comparePassword } from "./password.js";

describe("password", () => {
  it("hashes a password and verifies it matches", async () => {
    const hash = await hashPassword("s3cret!");
    expect(hash).not.toBe("s3cret!");
    expect(await comparePassword("s3cret!", hash)).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("s3cret!");
    expect(await comparePassword("wrong", hash)).toBe(false);
  });
});
