import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Upload() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    await API.post("/articles", {
      title,
      content,
      status: "Draft",
      date: new Date().toISOString(),
    });

    alert("Article created!");
    navigate("/dashboard");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Knowledge Article</h1>

      <input
        className="w-full border p-2 mb-3"
        placeholder="Title"
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="w-full border p-2 mb-3"
        placeholder="Content"
        rows={6}
        onChange={(e) => setContent(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        className="bg-green-500 text-white px-4 py-2"
      >
        Save Draft
      </button>
    </div>
  );
}

export default Upload;