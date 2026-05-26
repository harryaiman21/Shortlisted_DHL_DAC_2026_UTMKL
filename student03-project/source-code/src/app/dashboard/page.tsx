"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ArticleCard from "@/components/ArticleCard";
import SearchFilter from "@/components/SearchFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Article } from "@/types";

interface Stats {
  total: number;
  draft: number;
  reviewed: number;
  published: number;
  byBot: number;
  byHuman: number;
}

export default function DashboardPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [tag, setTag] = useState("");
  const [creator, setCreator] = useState("");
  const [date, setDate] = useState("");
  const [userRole, setUserRole] = useState("");
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") ?? "{}");
    setUserRole(user.role ?? "");
    fetchStats();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [search, status, tag, creator, date]);

  async function fetchStats() {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/stats", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setStats(data);
  }

  async function fetchArticles() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status && status !== "all") params.set("status", status);
    if (tag) params.set("tag", tag);
    if (creator) params.set("creator", creator);
    if (date) params.set("date", date);

    const token = localStorage.getItem("token");
    const res = await fetch(`/api/articles?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setArticles(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  // Recently processed — articles created by bot in last 5 minutes
  const recentlyProcessed = articles.filter((a) => {
    const diff = Date.now() - new Date(a.createdAt).getTime();
    return diff < 5 * 60 * 1000 && a.createdBy === "uipath-bot";
  });

  // All unique tags across all articles
  const allTags = [...new Set(articles.flatMap((a) => a.tags))].slice(0, 20);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Recently processed banner */}
        {recentlyProcessed.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <p className="text-green-800 font-medium">
                UiPath just automatically processed {recentlyProcessed.length}{" "}
                new article{recentlyProcessed.length > 1 ? "s" : ""}!
              </p>
              <p className="text-green-600 text-sm">
                Raw files from Google Drive were converted to clean SOPs
                automatically.
              </p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
            {[
              { label: "Total", value: stats.total, color: "bg-gray-800" },
              { label: "Draft", value: stats.draft, color: "bg-yellow-500" },
              {
                label: "Reviewed",
                value: stats.reviewed,
                color: "bg-blue-500",
              },
              {
                label: "Published",
                value: stats.published,
                color: "bg-green-500",
              },
              { label: "By Robot", value: stats.byBot, color: "bg-purple-500" },
              { label: "By Human", value: stats.byHuman, color: "bg-red-600" },
            ].map((s) => (
              <Card key={s.label} className="text-center">
                <CardContent className="pt-4 pb-3">
                  <div
                    className={`text-2xl font-black text-white ${s.color} rounded-lg py-1 mb-1`}
                  >
                    {s.value}
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">
                    {s.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tags cloud */}
        {allTags.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              BROWSE BY TAG
            </p>
            <div className="flex flex-wrap gap-2">
              {allTags.map((t) => (
                <Badge
                  key={t}
                  variant={tag === t ? "default" : "secondary"}
                  className={`cursor-pointer transition-all ${tag === t ? "bg-red-600 text-white" : "hover:bg-red-50 hover:text-red-700"}`}
                  onClick={() => setTag(tag === t ? "" : t)}
                >
                  {t}
                </Badge>
              ))}
              {tag && (
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => setTag("")}
                >
                  ✕ clear
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Knowledge Base</h1>
            <p className="text-muted-foreground text-sm">
              {articles.length} articles found
            </p>
          </div>
          {userRole !== "bot" && (
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => router.push("/upload")}
            >
              + New Article
            </Button>
          )}
        </div>

        <SearchFilter
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          tag={tag}
          setTag={setTag}
          creator={creator}
          setCreator={setCreator}
          date={date}
          setDate={setDate}
        />

        {loading ? (
          <div className="grid gap-4 mt-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No articles found.
          </div>
        ) : (
          <div className="grid gap-4 mt-6">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} onRefresh={fetchArticles} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
