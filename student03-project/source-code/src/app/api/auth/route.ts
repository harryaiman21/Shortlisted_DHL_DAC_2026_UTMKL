import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  const db = readDB();

  const user = db.users.find(
    (u) => u.username === username && u.password === password,
  );

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signToken({
    id: user.id,
    username: user.username,
    role: user.role,
  });
  return NextResponse.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      username: user.username,
    },
  });
}
