import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

export interface TokenPayload {
  id: string;
  username: string;
  role: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "8h" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: Request): TokenPayload | null {
  const auth = req.headers.get("authorization")?.replace("Bearer ", "");
  if (auth) return verifyToken(auth);
  return null;
}
