import { useNavigate, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import Header from "../components/Header";
import ArticleCard from "../components/ArticleCard";
import CompactUpload from "../components/CompactUpload";
import { useEffect, useState, useCallback } from "react";
import {
  getArticles,
  deleteArticle,
} from "../services/articleService";
import { isAuthenticated } from "../services/auth";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

 
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getArticles();

      setArticles(res.data || []);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

 
  const handleDelete = async (id: number) => {
    try {
      await deleteArticle(id);
      fetchArticles();
    } catch (error) {
      console.error("Failed to delete article:", error);
    }
  };

 
  useEffect(() => {
    const token = isAuthenticated();

    if (!token) {
      navigate("/", { replace: true });
    }
  }, [location.pathname, navigate]);

  
  useEffect(() => {
    if (isAuthenticated()) {
      fetchArticles();
    }
  }, [fetchArticles]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* TOP BAR */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-gray-900 mb-2">
              Knowledge Base Articles
            </h2>
            <p className="text-gray-600">
              Manage and organize operational documentation
            </p>
          </div>

          <button
            onClick={() => navigate("/create")}
            className="flex items-center gap-2 bg-[#d40511] text-white px-6 py-3 rounded-lg hover:bg-[#b00410] transition-colors shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
            New Article
          </button>
        </div>

        {/* UPLOAD */}
        <div className="mb-6">
          <CompactUpload onUploadSuccess={fetchArticles} />
        </div>

        {/* ARTICLES */}
        {loading ? (
          <div className="text-gray-600">
            Loading articles...
          </div>
        ) : articles.length === 0 ? (
          <div className="text-gray-500">
            No articles found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                id={article.id}
                title={article.title || "Untitled Article"}
                preview={
                  article.summary ||
                  article.content ||
                  "No preview available"
                }
                status={article.status || "draft"}
                date={
                  article.updatedAt
                    ? new Date(article.updatedAt).toLocaleDateString()
                    : "No date"
                }
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}