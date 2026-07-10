import { prisma } from "../src/core/prisma.js";
import { hashPassword } from "../src/core/password.js";

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD must be set");
  }

  const passwordHash = await hashPassword(password);

  const existing = await prisma.user.findUnique({ where: { email } });

  await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN" },
    create: { email, passwordHash, name: "Admin", role: "ADMIN" }
  });

  if (existing) {
    console.log(`Admin user already exists, password left unchanged: ${email}`);
  } else {
    console.log(`Seeded admin user: ${email}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
