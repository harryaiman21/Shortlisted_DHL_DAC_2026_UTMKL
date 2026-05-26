import { Upload, FileText } from "lucide-react";
import { useState } from "react";
import api from "../services/api";

interface Props {
  onUploadSuccess: () => void;
}

export default function CompactUpload({
  onUploadSuccess,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      await api.post(
        "/articles/upload",
        formData
      );

      alert("Upload successful!");

      setFile(null);

      onUploadSuccess();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-[#fff5f5] p-2 rounded-lg">
          <Upload className="w-5 h-5 text-[#d40511]" />
        </div>

        <div>
          <h3 className="font-semibold text-gray-900">
            Upload Knowledge File
          </h3>

          <p className="text-sm text-gray-500">
            PDF, DOCX, TXT, MSG
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <label className="flex-1 cursor-pointer border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 hover:border-[#d40511] transition-colors bg-gray-50">
          <div className="flex items-center gap-2 text-gray-600">
            <FileText className="w-4 h-4" />

            <span className="text-sm truncate">
              {file
                ? file.name
                : "Choose a file"}
            </span>
          </div>

          <input
            type="file"
            className="hidden"
            onChange={(e) =>
              setFile(
                e.target.files?.[0] || null
              )
            }
          />
        </label>

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="bg-[#d40511] text-white px-6 py-3 rounded-xl hover:bg-[#b00410] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading
            ? "Uploading..."
            : "Upload"}
        </button>
      </div>
    </div>
  );
}