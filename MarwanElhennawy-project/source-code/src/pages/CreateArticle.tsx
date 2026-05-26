import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { createArticle } from "../services/articleService";

export default function CreateArticle() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("draft");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createArticle({
        title,
        content,
        status,
        date: new Date().toLocaleDateString(),
      });

      alert("Article created successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Failed to create article");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto p-6">

        <h1 className="text-gray-900 mb-6">Create Article</h1>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">

          {/* TITLE */}
          <div>
            <label className="block mb-2">Title</label>
            <input
              className="w-full border p-2 rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* CONTENT */}
          <div>
            <label className="block mb-2">Content</label>
            <textarea
              className="w-full border p-2 rounded h-40"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          {/* STATUS */}
          <div>
            <label className="block mb-2">Status</label>
            <select
              className="w-full border p-2 rounded"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="reviewed">Reviewed</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="bg-[#d40511] text-white px-6 py-2 rounded"
          >
            Create Article
          </button>

        </form>
      </div>
    </div>
  );
}