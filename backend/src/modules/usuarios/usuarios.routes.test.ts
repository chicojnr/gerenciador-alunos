import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../app.js";
import { prisma } from "../../core/prisma.js";
import { loadConfig } from "../../core/config.js";
import { signAccessToken } from "../../core/jwt.js";
import { hashPassword } from "../../core/password.js";

describe("usuarios routes", () => {
  let app: FastifyInstance;
  let adminCookie: string;
  let nonAdminCookie: string;
  let adminId: string;

  beforeAll(async () => {
    app = await buildApp();
    const config = loadConfig();

    const admin = await prisma.user.upsert({
      where: { email: "usuarios-routes-admin@example.com" },
      update: { role: "ADMIN" },
      create: {
        email: "usuarios-routes-admin@example.com",
        passwordHash: await hashPassword("x"),
        name: "Routes Admin",
        role: "ADMIN"
      }
    });
    adminId = admin.id;
    adminCookie = `access_token=${signAccessToken(admin.id, admin.role, config.jwtAccessSecret)}`;

    const nonAdmin = await prisma.user.upsert({
      where: { email: "usuarios-routes-user@example.com" },
      update: { role: "USER" },
      create: {
        email: "usuarios-routes-user@example.com",
        passwordHash: await hashPassword("x"),
        name: "Routes User",
        role: "USER"
      }
    });
    nonAdminCookie = `access_token=${signAccessToken(nonAdmin.id, nonAdmin.role, config.jwtAccessSecret)}`;
  });

  beforeEach(async () => {
    await prisma.user.deleteMany({ where: { email: { contains: "@usuarios-routes-crud-test.com" } } });
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it("rejects unauthenticated requests", async () => {
    const response = await app.inject({ method: "GET", url: "/usuarios" });
    expect(response.statusCode).toBe(401);
  });

  it("rejects non-admin requests", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/usuarios",
      headers: { cookie: nonAdminCookie }
    });
    expect(response.statusCode).toBe(403);
  });

  it("allows non-admin users to read the lightweight options list", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/usuarios/options",
      headers: { cookie: nonAdminCookie }
    });
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body[0]).toHaveProperty("nome");
    expect(body[0]).not.toHaveProperty("passwordHash");
  });

  it("creates then lists a usuario, without leaking the password hash", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/usuarios",
      headers: { cookie: adminCookie },
      payload: {
        name: "Novo Usuario",
        email: "novo@usuarios-routes-crud-test.com",
        password: "senha-forte-123",
        role: "USER"
      }
    });
    expect(createRes.statusCode).toBe(201);
    expect(createRes.json().passwordHash).toBeUndefined();

    const listRes = await app.inject({
      method: "GET",
      url: "/usuarios",
      headers: { cookie: adminCookie }
    });
    expect(listRes.statusCode).toBe(200);
    const body = listRes.json();
    const created = body.items.find(
      (u: { email: string }) => u.email === "novo@usuarios-routes-crud-test.com"
    );
    expect(created).toBeTruthy();
    expect(created.passwordHash).toBeUndefined();
  });

  it("updates name, email, role and password via PUT", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/usuarios",
      headers: { cookie: adminCookie },
      payload: {
        name: "Editar Antes",
        email: "editar-antes@usuarios-routes-crud-test.com",
        password: "senha-forte-123",
        role: "USER"
      }
    });
    const { id } = createRes.json();

    const updateRes = await app.inject({
      method: "PUT",
      url: `/usuarios/${id}`,
      headers: { cookie: adminCookie },
      payload: {
        name: "Editar Depois",
        email: "editar-depois@usuarios-routes-crud-test.com",
        role: "ADMIN",
        password: "senha-nova-456"
      }
    });
    expect(updateRes.statusCode).toBe(200);
    const body = updateRes.json();
    expect(body.name).toBe("Editar Depois");
    expect(body.email).toBe("editar-depois@usuarios-routes-crud-test.com");
    expect(body.role).toBe("ADMIN");
    expect(body.passwordHash).toBeUndefined();
  });

  it("rejects deactivating your own account", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: `/usuarios/${adminId}`,
      headers: { cookie: adminCookie }
    });
    expect(response.statusCode).toBe(400);
  });

  it("soft-deletes a different usuario", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/usuarios",
      headers: { cookie: adminCookie },
      payload: {
        name: "Para Desativar",
        email: "desativar@usuarios-routes-crud-test.com",
        password: "senha-forte-123",
        role: "USER"
      }
    });
    const { id } = createRes.json();

    const deleteRes = await app.inject({
      method: "DELETE",
      url: `/usuarios/${id}`,
      headers: { cookie: adminCookie }
    });
    expect(deleteRes.statusCode).toBe(200);

    const listRes = await app.inject({
      method: "GET",
      url: "/usuarios",
      headers: { cookie: adminCookie }
    });
    const stillListed = listRes
      .json()
      .items.some((u: { email: string }) => u.email === "desativar@usuarios-routes-crud-test.com");
    expect(stillListed).toBe(false);
  });
});
