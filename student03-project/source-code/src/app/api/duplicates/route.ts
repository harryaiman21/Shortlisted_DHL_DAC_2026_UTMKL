import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const hash = searchParams.get("hash") ?? "";

  const db = readDB();
  const found = db.duplicateHashes.find((h) => h.hash === hash);

  if (!found) return NextResponse.json({ isDuplicate: false });

  const diffDays =
    (Date.now() - new Date(found.checkedAt).getTime()) / (1000 * 60 * 60 * 24);

  return NextResponse.json({ isDuplicate: diffDays < 14 });
}

export async function POST(req: Request) {
  const { hash } = await req.json();
  const db = readDB();

  const existing = db.duplicateHashes.findIndex((h) => h.hash === hash);
  if (existing !== -1) {
    db.duplicateHashes[existing].checkedAt = new Date().toISOString();
  } else {
    db.duplicateHashes.push({
      id: uuidv4(),
      hash,
      checkedAt: new Date().toISOString(),
    });
  }

  writeDB(db);
  return NextResponse.json({ success: true });
}
