import jwt from "jsonwebtoken";

export interface TokenPayload {
  userId: string;
}

export function signAccessToken(userId: string, secret: string): string {
  return jwt.sign({ userId }, secret, { expiresIn: "15m" });
}

export function signRefreshToken(userId: string, secret: string): string {
  return jwt.sign({ userId }, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string, secret: string): TokenPayload {
  const decoded = jwt.verify(token, secret);
  if (typeof decoded === "string" || !("userId" in decoded)) {
    throw new Error("Invalid token payload");
  }
  return { userId: decoded.userId as string };
}
