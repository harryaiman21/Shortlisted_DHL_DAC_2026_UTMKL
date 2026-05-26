import { Badge } from "@/components/ui/badge";
import type { ArticleStatus } from "@/types";

const colours: Record<ArticleStatus, string> = {
  Draft: "bg-yellow-100 text-yellow-800",
  Reviewed: "bg-blue-100 text-blue-800",
  Published: "bg-green-100 text-green-800",
};

export default function StatusBadge({ status }: { status: ArticleStatus }) {
  return (
    <span
      className={`text-xs font-medium px-2 py-1 rounded-full ${colours[status]}`}
    >
      {status}
    </span>
  );
}
