"use client";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "./StatusBadge";
import type { Article } from "@/types";

export default function ArticleCard({
  article,
  onRefresh,
}: {
  article: Article;
  onRefresh: () => void;
}) {
  const router = useRouter();
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-transparent hover:border-l-red-500"
      onClick={() => router.push(`/articles/${article.id}`)}
    >
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <StatusBadge status={article.status} />
              <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded">
                {article.category}
              </span>
              {article.createdBy === "uipath-bot" && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                  🤖 Auto-generated
                </span>
              )}
            </div>
            <h3 className="font-semibold text-base truncate">
              {article.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {article.summary}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              By <strong>{article.createdBy}</strong> ·{" "}
              {new Date(article.createdAt).toLocaleDateString("en-MY")}
            </p>
          </div>
        </div>
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
