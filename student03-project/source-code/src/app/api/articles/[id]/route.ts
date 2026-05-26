import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { getTokenFromRequest } from "@/lib/auth";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const db = readDB();
  const article = db.articles.find((a) => a.id === id);
  if (!article)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(article);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = getTokenFromRequest(req);
  const body = await req.json();
  const db = readDB();
  const idx = db.articles.findIndex((a) => a.id === id);
  if (idx === -1)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = db.articles[idx];
  const now = new Date().toISOString();

  if (body.status === "Published" && user?.role === "editor") {
    return NextResponse.json(
      { error: "Editors cannot publish articles. Only admins can." },
      { status: 403 },
    );
  }

  const updated = { ...existing, ...body, updatedAt: now };

  if (body.status && body.status !== existing.status) {
    updated.statusHistory = [
      ...(existing.statusHistory ?? []),
      {
        status: body.status,
        changedAt: now,
        by: user?.username ?? body.updatedBy ?? "system",
        note: body.processingNote ?? undefined,
      },
    ];
  }

  db.articles[idx] = updated;
  writeDB(db);
  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = getTokenFromRequest(req);

  if (user?.role !== "admin") {
    return NextResponse.json(
      { error: "Only admins can delete articles." },
      { status: 403 },
    );
  }

  const db = readDB();
  const exists = db.articles.find((a) => a.id === id);
  if (!exists)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  db.articles = db.articles.filter((a) => a.id !== id);
  writeDB(db);
  return NextResponse.json({ success: true });
}
