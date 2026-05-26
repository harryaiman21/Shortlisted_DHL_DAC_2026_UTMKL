"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import DraftBuilder from "@/components/DraftBuilder";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StructuredArticle } from "@/lib/gemini";

export default function UploadPage() {
  const [rawText, setRawText] = useState("");
  const [draft, setDraft] = useState<
    (StructuredArticle & { rawInput: string }) | null
  >(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type === "text/plain") {
      setRawText(await file.text());
    }
  }

  async function processText() {
    if (!rawText.trim()) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rawText, source: "manual-upload" }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Error: " + (data.error ?? "Something went wrong"));
        return;
      }

      setDraft({
        title: data.title ?? "Untitled",
        summary: data.summary ?? "",
        steps: Array.isArray(data.steps) ? data.steps : [],
        tags: Array.isArray(data.tags) ? data.tags : [],
        category: data.category ?? "General",
        rawInput: rawText,
      });
    } catch (err) {
      alert("Failed to process: " + String(err));
    } finally {
      setLoading(false);
    }
  }

  async function saveDraft(
    finalDraft: StructuredArticle & { rawInput: string },
  ) {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") ?? "{}");
    await fetch("/api/articles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...finalDraft,
        createdBy: user.username ?? "editor",
      }),
    });
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Upload Raw Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Upload File (txt, PDF, docx)</Label>
              <input
                type="file"
                accept=".txt,.pdf,.docx,.png,.jpg"
                onChange={handleFile}
                className="block text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
              />
            </div>
            <div className="space-y-2">
              <Label>Or paste raw text</Label>
              <Textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste chat logs, emails, notes, anything messy..."
                rows={10}
              />
            </div>
            <Button
              onClick={processText}
              disabled={loading || !rawText.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Processing with AI..." : "Process with AI →"}
            </Button>
          </CardContent>
        </Card>

        {draft && <DraftBuilder draft={draft} onSave={saveDraft} />}
      </main>
    </div>
  );
}
