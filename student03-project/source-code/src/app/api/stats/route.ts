import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";

export async function GET() {
  const db = readDB();
  const articles = db.articles;

  const stats = {
    total: articles.length,
    draft: articles.filter((a) => a.status === "Draft").length,
    reviewed: articles.filter((a) => a.status === "Reviewed").length,
    published: articles.filter((a) => a.status === "Published").length,
    byBot: articles.filter((a) => a.createdBy === "uipath-bot").length,
    byHuman: articles.filter((a) => a.createdBy !== "uipath-bot").length,
    categories: articles.reduce(
      (acc, a) => {
        acc[a.category] = (acc[a.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
    recentActivity: articles
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, 5)
      .map((a) => ({
        title: a.title,
        status: a.status,
        updatedAt: a.updatedAt,
        createdBy: a.createdBy,
      })),
  };

  return NextResponse.json(stats);
}
