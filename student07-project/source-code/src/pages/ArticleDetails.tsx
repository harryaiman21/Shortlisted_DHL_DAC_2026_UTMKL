import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar,
  Edit,
  Trash2,
  ArrowLeft,
} from "lucide-react";

import Header from "../components/Header";

import {
  getArticleById,
  deleteArticle,
} from "../services/articleService";

export default function ArticleDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [article, setArticle] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  // =========================
  // FETCH ARTICLE
  // =========================
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res =
          await getArticleById(Number(id));

        setArticle(res.data);
      } catch (error) {
        console.error(
          "Failed to load article:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  // =========================
  // DELETE ARTICLE
  // =========================
  const handleDelete = async () => {
    try {
      await deleteArticle(Number(id));

      navigate("/dashboard");
    } catch (error) {
      console.error(
        "Delete failed:",
        error
      );
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="p-6">
        <Header />

        <p className="text-gray-600">
          Loading article...
        </p>
      </div>
    );
  }

  // =========================
  // ARTICLE NOT FOUND
  // =========================
  if (!article) {
    return (
      <div className="p-6">
        <Header />

        <p className="text-red-500">
          Article not found
        </p>
      </div>
    );
  }

  // =========================
  // STATUS COLORS
  // =========================
  const statusColors: any = {
    processing:
      "bg-blue-100 text-blue-700",

    completed:
      "bg-green-100 text-green-700",

    failed:
      "bg-red-100 text-red-700",

    draft:
      "bg-gray-200 text-gray-700",

    reviewed:
      "bg-yellow-100 text-yellow-700",

    published:
      "bg-green-500 text-white",
  };

  // =========================
  // PARSE CONTENT
  // =========================
  let parsedContent: any = null;

  try {
    parsedContent = JSON.parse(
      article.content
    );
  } catch {
    parsedContent = null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* BACK BUTTON */}
        <button
          onClick={() =>
            navigate("/dashboard")
          }
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />

          Back to Dashboard
        </button>

        {/* ARTICLE CARD */}
        <div className="bg-white rounded-2xl shadow-sm p-8">

          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">

            <div>

              {/* TITLE */}
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {article.title}
                </h1>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[article.status]}`}
                >
                  {article.status}
                </span>
              </div>

              {/* DATES */}
              <div className="flex flex-col gap-2 text-sm text-gray-600">

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />

                  <span>
                    Created:{" "}
                    {article.createdAt
                      ? new Date(
                          article.createdAt
                        ).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />

                  <span>
                    Updated:{" "}
                    {article.updatedAt
                      ? new Date(
                          article.updatedAt
                        ).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>

                <span>
                  By Admin
                </span>

              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3">

              <button
                onClick={() =>
                  navigate(`/edit/${id}`)
                }
                className="flex items-center gap-2 px-4 py-2 bg-[#ffcc00] hover:bg-yellow-400 text-gray-900 rounded-lg transition"
              >
                <Edit className="w-4 h-4" />

                Edit
              </button>

              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />

                Delete
              </button>

            </div>
          </div>

          {/* CONTENT */}
          <div className="border-t pt-8">

            {/* AI STRUCTURED ARTICLE */}
            {parsedContent ? (
              <div className="space-y-8">

                {/* SUMMARY */}
                <div>
                  <h2 className="text-2xl font-semibold mb-3">
                    Summary
                  </h2>

                  <p className="text-gray-700 leading-relaxed">
                    {parsedContent.summary}
                  </p>
                </div>

                {/* STEPS */}
                <div>
                  <h2 className="text-2xl font-semibold mb-3">
                    Steps
                  </h2>

                  <ul className="list-disc ml-6 space-y-2 text-gray-700">
                    {parsedContent.steps?.map(
                      (
                        step: string,
                        index: number
                      ) => (
                        <li key={index}>
                          {step}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {/* ROLES */}
                <div>
                  <h2 className="text-2xl font-semibold mb-3">
                    Roles
                  </h2>

                  {parsedContent.roles &&
                  parsedContent.roles.length >
                    0 ? (
                    <ul className="list-disc ml-6 space-y-2 text-gray-700">
                      {parsedContent.roles.map(
                        (
                          role: string,
                          index: number
                        ) => (
                          <li key={index}>
                            {role}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-gray-500">
                      No roles detected
                    </p>
                  )}
                </div>

                {/* KEY POINTS */}
                <div>
                  <h2 className="text-2xl font-semibold mb-3">
                    Key Points
                  </h2>

                  {parsedContent.keyPoints &&
                  parsedContent.keyPoints
                    .length > 0 ? (
                    <ul className="list-disc ml-6 space-y-2 text-gray-700">
                      {parsedContent.keyPoints.map(
                        (
                          point: string,
                          index: number
                        ) => (
                          <li key={index}>
                            {point}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-gray-500">
                      No key points detected
                    </p>
                  )}
                </div>

                {/* RISKS */}
                <div>
                  <h2 className="text-2xl font-semibold mb-3">
                    Risks
                  </h2>

                  {parsedContent.risks &&
                  parsedContent.risks.length >
                    0 ? (
                    <ul className="list-disc ml-6 space-y-2 text-gray-700">
                      {parsedContent.risks.map(
                        (
                          risk: string,
                          index: number
                        ) => (
                          <li key={index}>
                            {risk}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-gray-500">
                      No risks detected
                    </p>
                  )}
                </div>

                {/* NOTES */}
                <div>
                  <h2 className="text-2xl font-semibold mb-3">
                    Notes
                  </h2>

                  <p className="text-gray-700 leading-relaxed">
                    {parsedContent.notes ||
                      "No additional notes"}
                  </p>
                </div>

              </div>
            ) : (
              // FALLBACK FOR NORMAL TEXT ARTICLES
              <div>
                <h2 className="text-2xl font-semibold mb-4">
                  Content
                </h2>

                <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {article.content}
                </pre>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}