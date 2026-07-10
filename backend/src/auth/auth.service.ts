import { prisma } from "../core/prisma.js";
import { comparePassword } from "../core/password.js";
import { signAccessToken, signRefreshToken } from "../core/jwt.js";
import type { Config } from "../core/config.js";

export class InvalidCredentialsError extends Error {}

// Fixed bcrypt hash used to equalize response time when no user is found,
// so login() doesn't leak account existence via timing.
const DUMMY_HASH = "$2b$10$S8CNJnef94vRcqmpN4FBJerGyOCmL3ill4DOEcI0cU..CFpEALAIS";

export async function login(email: string, password: string, config: Config) {
  const user = await prisma.user.findUnique({ where: { email } });

  const valid = await comparePassword(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !valid) {
    throw new InvalidCredentialsError();
  }

  return {
    userId: user.id,
    accessToken: signAccessToken(user.id, config.jwtAccessSecret),
    refreshToken: signRefreshToken(user.id, config.jwtRefreshSecret)
  };
}
