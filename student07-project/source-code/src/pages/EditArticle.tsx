import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import {
  getArticleById,
  updateArticle,
} from "../services/articleService";

export default function EditArticle() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [title, setTitle] =
    useState("");

  const [summary, setSummary] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [steps, setSteps] =
    useState("");

  const [roles, setRoles] =
    useState("");

  const [keyPoints, setKeyPoints] =
    useState("");

  const [risks, setRisks] =
    useState("");

  const [status, setStatus] =
    useState("draft");

  const [loading, setLoading] =
    useState(true);

  // FETCH ARTICLE
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res =
          await getArticleById(
            Number(id)
          );

        const article = res.data;

        setTitle(
          article.title || ""
        );

        setSummary(
          article.summary || ""
        );

        setNotes(
          article.notes || ""
        );

        setStatus(
          article.status || "draft"
        );

        // ARRAY FIELDS
        setSteps(
          article.steps
            ? JSON.parse(article.steps)
                .map(
                  (s: any) =>
                    typeof s === "string"
                      ? s
                      : s.action
                )
                .join("\n")
            : ""
        );

        setRoles(
          article.roles
            ? JSON.parse(article.roles).join(
                "\n"
              )
            : ""
        );

        setKeyPoints(
          article.keyPoints
            ? JSON.parse(
                article.keyPoints
              ).join("\n")
            : ""
        );

        setRisks(
          article.risks
            ? JSON.parse(article.risks).join(
                "\n"
              )
            : ""
        );

      } catch (error) {
        console.error(
          "Failed to load article",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  // UPDATE ARTICLE
  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {

      const structuredContent = {
        title,
        summary,

        steps: steps
          .split("\n")
          .filter(Boolean),

        roles: roles
          .split("\n")
          .filter(Boolean),

        keyPoints: keyPoints
          .split("\n")
          .filter(Boolean),

        risks: risks
          .split("\n")
          .filter(Boolean),

        notes,
      };

      await updateArticle(
        Number(id),
        {
          title,

          content:
            JSON.stringify(
              structuredContent
            ),

          summary,

          notes,

          steps: JSON.stringify(
            structuredContent.steps
          ),

          roles: JSON.stringify(
            structuredContent.roles
          ),

          keyPoints:
            JSON.stringify(
              structuredContent.keyPoints
            ),

          risks: JSON.stringify(
            structuredContent.risks
          ),

          status,
        }
      );

      navigate(`/article/${id}`);

    } catch (error) {
      console.error(
        "Failed to update article:",
        error
      );

      alert(
        "Failed to update article"
      );
    }
  };

  // LOADING
  if (loading) {
    return (
      <div className="p-6">
        <Header />

        <p>
          Loading article...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto px-6 py-8">

        <div className="bg-white rounded-xl shadow-sm p-8">

          <h1 className="text-2xl text-gray-900 mb-6">
            Edit Article
          </h1>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* TITLE */}
            <div>
              <label className="block text-gray-700 mb-2">
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
                className="w-full border border-gray-200 rounded-lg px-4 py-3"
                required
              />
            </div>

            {/* SUMMARY */}
            <div>
              <label className="block text-gray-700 mb-2">
                Summary
              </label>

              <textarea
                value={summary}
                onChange={(e) =>
                  setSummary(
                    e.target.value
                  )
                }
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-4 py-3"
              />
            </div>

            {/* STEPS */}
            <div>
              <label className="block text-gray-700 mb-2">
                Steps (one per line)
              </label>

              <textarea
                value={steps}
                onChange={(e) =>
                  setSteps(
                    e.target.value
                  )
                }
                rows={5}
                className="w-full border border-gray-200 rounded-lg px-4 py-3"
              />
            </div>

            {/* ROLES */}
            <div>
              <label className="block text-gray-700 mb-2">
                Roles (one per line)
              </label>

              <textarea
                value={roles}
                onChange={(e) =>
                  setRoles(
                    e.target.value
                  )
                }
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-4 py-3"
              />
            </div>

            {/* KEY POINTS */}
            <div>
              <label className="block text-gray-700 mb-2">
                Key Points (one per line)
              </label>

              <textarea
                value={keyPoints}
                onChange={(e) =>
                  setKeyPoints(
                    e.target.value
                  )
                }
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-4 py-3"
              />
            </div>

            {/* RISKS */}
            <div>
              <label className="block text-gray-700 mb-2">
                Risks (one per line)
              </label>

              <textarea
                value={risks}
                onChange={(e) =>
                  setRisks(
                    e.target.value
                  )
                }
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-4 py-3"
              />
            </div>

            {/* NOTES */}
            <div>
              <label className="block text-gray-700 mb-2">
                Notes
              </label>

              <textarea
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-4 py-3"
              />
            </div>

            {/* STATUS */}
            <div>
              <label className="block text-gray-700 mb-2">
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value
                  )
                }
                className="w-full border border-gray-200 rounded-lg px-4 py-3"
              >
                <option value="draft">
                  Draft
                </option>

                <option value="reviewed">
                  Reviewed
                </option>

                <option value="published">
                  Published
                </option>

                <option value="processing">
                  Processing
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="failed">
                  Failed
                </option>

              </select>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-4">

              <button
                type="submit"
                className="bg-[#d40511] text-white px-6 py-3 rounded-lg hover:bg-[#b00410]"
              >
                Save Changes
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/article/${id}`
                  )
                }
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>

            </div>

          </form>

        </div>
      </div>
    </div>
  );
}