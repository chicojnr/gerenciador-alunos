import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "../../core/prisma.js";
import {
  usuarioService,
  UsuarioNotFoundError,
  CannotDeactivateSelfError
} from "./usuarios.service.js";

describe("usuarioService", () => {
  beforeEach(async () => {
    await prisma.user.deleteMany({ where: { email: { contains: "@usuarios-service-test.com" } } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates and retrieves a usuario, never exposing the password hash", async () => {
    const created = await usuarioService.create({
      name: "Fulano",
      email: "fulano@usuarios-service-test.com",
      password: "senha-forte-123",
      role: "USER"
    });
    expect((created as { passwordHash?: string }).passwordHash).toBeUndefined();

    const found = await usuarioService.getById(created.id);
    expect(found.name).toBe("Fulano");
    expect(found.role).toBe("USER");
    expect(found.ativo).toBe(true);
    expect((found as { passwordHash?: string }).passwordHash).toBeUndefined();
  });

  it("throws UsuarioNotFoundError for missing id", async () => {
    await expect(usuarioService.getById("00000000-0000-0000-0000-000000000000")).rejects.toThrow(
      UsuarioNotFoundError
    );
  });

  it("lists only active usuarios after soft delete", async () => {
    const a = await usuarioService.create({
      name: "Usuario A",
      email: "a@usuarios-service-test.com",
      password: "senha-forte-123",
      role: "USER"
    });
    const b = await usuarioService.create({
      name: "Usuario B",
      email: "b@usuarios-service-test.com",
      password: "senha-forte-123",
      role: "USER"
    });
    await usuarioService.remove(a.id, b.id);

    // The User table is shared across every test file's fixtures (with
    // fileParallelism disabled they run sequentially, not isolated), so a
    // fixed total count isn't reliable here — assert presence/absence of
    // this test's own rows instead, same as the escolas/periodos route tests do.
    const { items } = await usuarioService.list(1, 1000);
    const names = items.map((u) => u.name);
    expect(names).toContain("Usuario B");
    expect(names).not.toContain("Usuario A");
  });

  it("rejects creating a usuario with an empty name", async () => {
    await expect(
      usuarioService.create({
        name: "",
        email: "empty-name@usuarios-service-test.com",
        password: "senha-forte-123",
        role: "USER"
      })
    ).rejects.toThrow();
  });

  it("rejects creating a usuario with a short password", async () => {
    await expect(
      usuarioService.create({
        name: "Curto",
        email: "curto@usuarios-service-test.com",
        password: "1234567",
        role: "USER"
      })
    ).rejects.toThrow();
  });

  it("rejects creating a usuario with a duplicate email", async () => {
    await usuarioService.create({
      name: "Original",
      email: "duplicado@usuarios-service-test.com",
      password: "senha-forte-123",
      role: "USER"
    });
    await expect(
      usuarioService.create({
        name: "Duplicado",
        email: "duplicado@usuarios-service-test.com",
        password: "senha-forte-123",
        role: "USER"
      })
    ).rejects.toThrow();
  });

  it("rejects an admin deactivating their own account", async () => {
    const admin = await usuarioService.create({
      name: "Admin Solo",
      email: "admin-solo@usuarios-service-test.com",
      password: "senha-forte-123",
      role: "ADMIN"
    });
    await expect(usuarioService.remove(admin.id, admin.id)).rejects.toThrow(
      CannotDeactivateSelfError
    );
  });
});
