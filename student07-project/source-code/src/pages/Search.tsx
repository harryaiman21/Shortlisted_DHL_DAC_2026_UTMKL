import { useEffect, useState } from "react";
import {
  Search as SearchIcon,
  Filter,
  Calendar,
  Tag,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import ArticleCard from "../components/ArticleCard";
import { getArticles } from "../services/articleService";

export default function Search() {
  const navigate = useNavigate();

  const [articles, setArticles] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const availableTags = [
    "handling",
    "procedures",
    "safety",
    "operations",
    "customer-service",
    "tracking",
  ];

  // FETCH FROM BACKEND
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getArticles();
        setArticles(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // FILTER LOGIC
  useEffect(() => {
    let result = [...articles];

    // search
    if (searchQuery) {
      result = result.filter((a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // status
    if (statusFilter !== "all") {
      result = result.filter((a) => a.status === statusFilter);
    }

    // tags (if backend supports tags)
    if (selectedTags.length > 0) {
      result = result.filter((a) =>
        selectedTags.some((tag) => a.tags?.includes(tag))
      );
    }

    // date filter (basic)
    if (dateFrom) {
      result = result.filter(
        (a) => new Date(a.date) >= new Date(dateFrom)
      );
    }

    if (dateTo) {
      result = result.filter(
        (a) => new Date(a.date) <= new Date(dateTo)
      );
    }

    setFiltered(result);
  }, [searchQuery, statusFilter, dateFrom, dateTo, selectedTags, articles]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* BACK */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        {/* TITLE */}
        <div className="mb-8">
          <h2 className="text-gray-900 mb-2">Search Knowledge Base</h2>
          <p className="text-gray-600">
            Find articles using real backend data
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="relative mb-6">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-12 pr-4 py-4 border rounded-lg"
            />
          </div>

          {/* FILTERS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border p-2 rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="reviewed">Reviewed</option>
              <option value="published">Published</option>
            </select>

            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border p-2 rounded-lg"
            />

            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border p-2 rounded-lg"
            />
          </div>

          {/* TAGS */}
          <div className="flex flex-wrap gap-2 mt-4">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded ${
                  selectedTags.includes(tag)
                    ? "bg-[#d40511] text-white"
                    : "bg-gray-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* RESULTS */}
        <div className="mb-4 text-gray-600">
          Found {filtered.length} articles
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((article) => (
              <ArticleCard
                key={article.id}
                id={article.id}
                title={article.title}
                preview={article.content}
                status={article.status}
                date={
                        article.updatedAt
                          ? new Date(article.updatedAt).toLocaleDateString()
                          : "N/A"
                      }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}