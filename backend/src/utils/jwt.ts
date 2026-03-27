import jwt from "jsonwebtoken";

const JWT_SECRET = process.env["JWT_SECRET"]!;

export type AuthJwtPayload = {
  userId: number;
  email: string;
};

export function generateAccessToken(payload: AuthJwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export function verifyAccessToken(token: string): AuthJwtPayload {
  return jwt.verify(token, JWT_SECRET) as AuthJwtPayload;
}