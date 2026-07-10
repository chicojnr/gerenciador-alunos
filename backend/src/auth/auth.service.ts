import { prisma } from "../core/prisma.js";
import { comparePassword } from "../core/password.js";
import { signAccessToken, signRefreshToken } from "../core/jwt.js";
import type { Config } from "../core/config.js";

export class InvalidCredentialsError extends Error {}

export async function login(email: string, password: string, config: Config) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new InvalidCredentialsError();
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw new InvalidCredentialsError();
  }

  return {
    userId: user.id,
    accessToken: signAccessToken(user.id, config.jwtAccessSecret),
    refreshToken: signRefreshToken(user.id, config.jwtRefreshSecret)
  };
}
