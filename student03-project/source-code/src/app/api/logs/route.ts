import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const db = readDB();
  return NextResponse.json(db.logs);
}

export async function POST(req: Request) {
  const { message, level } = await req.json();
  const db = readDB();

  db.logs.push({
    id: uuidv4(),
    message,
    level: level ?? "info",
    createdAt: new Date().toISOString(),
  });

  writeDB(db);
  return NextResponse.json({ success: true });
}
