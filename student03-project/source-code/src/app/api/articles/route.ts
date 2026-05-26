import { NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { getTokenFromRequest } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import type { Article } from "@/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const tag = searchParams.get("tag") ?? "";
  const creator = searchParams.get("creator") ?? "";
  const date = searchParams.get("date") ?? "";

  const db = readDB();
  let articles = db.articles;

  if (search) {
    articles = articles.filter(
      (a) =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.summary.toLowerCase().includes(search.toLowerCase()),
    );
  }
  if (status && status !== "all") {
    articles = articles.filter((a) => a.status === status);
  }
  if (tag) {
    articles = articles.filter((a) => a.tags.includes(tag));
  }
  if (creator) {
    articles = articles.filter((a) => a.createdBy === creator);
  }
  if (date) {
    articles = articles.filter((a) => a.createdAt.startsWith(date));
  }

  articles = articles.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return NextResponse.json(articles);
}

export async function POST(req: Request) {
  const body = await req.json();
  const db = readDB();
  const now = new Date().toISOString();

  const article: Article = {
    id: uuidv4(),
    title: body.title ?? "Untitled",
    summary: body.summary ?? "",
    steps: body.steps ?? [],
    tags: body.tags ?? [],
    category: body.category ?? "General",
    rawInput: body.rawInput ?? "",
    source: body.source ?? "manual",
    status: "Draft",
    statusHistory: [
      { status: "Draft", changedAt: now, by: body.createdBy ?? "system" },
    ],
    createdBy: body.createdBy ?? "system",
    fileAttachments: body.fileAttachments ?? [],
    createdAt: now,
    updatedAt: now,
  };

  db.articles.push(article);
  writeDB(db);
  return NextResponse.json(article, { status: 201 });
}
