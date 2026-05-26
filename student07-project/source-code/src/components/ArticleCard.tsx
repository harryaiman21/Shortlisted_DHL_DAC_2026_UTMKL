import { useNavigate } from "react-router-dom";
import { Calendar, FileText } from "lucide-react";

interface ArticleCardProps {
  id: number;
  title: string;
  preview: string;
  status: string;
  date: string;
  onDelete?: (id: number) => void;
}

export default function ArticleCard({
  id,
  title,
  preview,
  status,
  date,
  onDelete,
}: ArticleCardProps) {
  const navigate = useNavigate();

  const statusColors: Record<string, string> = {
    draft: "bg-gray-200 text-gray-700",

    reviewed: "bg-[#ffcc00] text-gray-900",

    published: "bg-green-500 text-white",

    processing: "bg-blue-500 text-white",

    completed: "bg-green-600 text-white",

    failed: "bg-red-500 text-white",
  };

  const statusLabels: Record<string, string> = {
    draft: "Draft",

    reviewed: "Reviewed",

    published: "Published",

    processing: "Processing",

    completed: "Completed",

    failed: "Failed",
  };

  return (
    <div
      onClick={() => navigate(`/article/${id}`)}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 p-6"
    >
      {/* HEADER */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#d40511]" />

          <h3 className="text-gray-900 font-semibold">
            {title}
          </h3>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-sm ${
            statusColors[status] ||
            "bg-gray-300 text-black"
          }`}
        >
          {statusLabels[status] || status}
        </span>
      </div>

      {/* CONTENT PREVIEW */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {preview}
      </p>

      {/* FOOTER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />

          <span>{date}</span>
        </div>

        {/* DELETE BUTTON */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            className="text-red-600 text-sm hover:underline"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}