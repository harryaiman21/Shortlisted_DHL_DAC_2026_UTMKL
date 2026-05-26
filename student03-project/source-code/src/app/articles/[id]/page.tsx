"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Article, ArticleStatus } from "@/types";

const STATUS_ORDER: ArticleStatus[] = ["Draft", "Reviewed", "Published"];

export default function ArticlePage() {
  const { id } = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ArticleStatus | null>(
    null,
  );
  const [userRole, setUserRole] = useState("");
  const [username, setUsername] = useState("");
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editSteps, setEditSteps] = useState<string[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") ?? "{}");
    setUserRole(user.role ?? "");
    setUsername(user.username ?? "");
    loadArticle();
  }, [id]);

  async function loadArticle() {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/articles/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      return;
    }
    setArticle({
      ...data,
      steps: Array.isArray(data.steps) ? data.steps : [],
      tags: Array.isArray(data.tags) ? data.tags : [],
      statusHistory: Array.isArray(data.statusHistory)
        ? data.statusHistory
        : [],
      fileAttachments: Array.isArray(data.fileAttachments)
        ? data.fileAttachments
        : [],
    });
    setLoading(false);
  }

  async function confirmStatusChange() {
    if (!pendingStatus) return;
    setStatusLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/articles/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: pendingStatus, updatedBy: username }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Failed to update status");
      setPendingStatus(null);
      setStatusLoading(false);
      return;
    }
    setArticle({
      ...data,
      steps: Array.isArray(data.steps) ? data.steps : [],
      tags: Array.isArray(data.tags) ? data.tags : [],
      statusHistory: Array.isArray(data.statusHistory)
        ? data.statusHistory
        : [],
      fileAttachments: Array.isArray(data.fileAttachments)
        ? data.fileAttachments
        : [],
    });
    setPendingStatus(null);
    setStatusLoading(false);
  }

  async function saveEdit() {
    setSaveLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/articles/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: editTitle,
        summary: editSummary,
        steps: editSteps,
        updatedBy: username,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Failed to save");
      setSaveLoading(false);
      return;
    }
    setArticle({
      ...data,
      steps: Array.isArray(data.steps) ? data.steps : [],
      tags: Array.isArray(data.tags) ? data.tags : [],
      statusHistory: Array.isArray(data.statusHistory)
        ? data.statusHistory
        : [],
      fileAttachments: Array.isArray(data.fileAttachments)
        ? data.fileAttachments
        : [],
    });
    setEditing(false);
    setSaveLoading(false);
  }

  async function deleteArticle() {
    if (
      !confirm(
        "Are you sure you want to delete this article? This cannot be undone.",
      )
    )
      return;
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/articles/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error ?? "Failed to delete");
      return;
    }
    router.push("/dashboard");
  }

  function copyToClipboard() {
    if (!article) return;
    const text = `${article.title}\n\n${article.summary}\n\nSteps:\n${article.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nTags: ${article.tags.join(", ")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function exportToPDF() {
    window.print();
  }

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-muted-foreground">
          Loading article...
        </div>
      </div>
    );

  if (!article)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-muted-foreground">
          Article not found.
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <StatusBadge status={article.status} />
              <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                {article.category}
              </span>
              <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                via {article.source}
              </span>
              {article.createdBy === "uipath-bot" && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  🤖 Auto-generated
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold">{article.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Created by <strong>{article.createdBy}</strong> on{" "}
              {new Date(article.createdAt).toLocaleDateString("en-MY", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap justify-end no-print">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              {copied ? "✅ Copied!" : "📋 Copy SOP"}
            </Button>
            <Button variant="outline" size="sm" onClick={exportToPDF}>
              🖨️ Export PDF
            </Button>
            {userRole === "admin" && !editing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditTitle(article.title);
                  setEditSummary(article.summary);
                  setEditSteps([...article.steps]);
                  setEditing(true);
                }}
              >
                ✏️ Edit
              </Button>
            )}
            {userRole === "admin" && (
              <Button variant="destructive" size="sm" onClick={deleteArticle}>
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <Textarea
                value={editSummary}
                onChange={(e) => setEditSummary(e.target.value)}
                rows={4}
                className="w-full"
              />
            ) : (
              <p className="text-sm leading-relaxed text-gray-700">
                {article.summary || "No summary available."}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Steps */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Step-by-Step Procedure</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-2">
                {editSteps.map((step, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xs font-bold mt-1">
                      {i + 1}
                    </span>
                    <Input
                      value={step}
                      onChange={(e) => {
                        const copy = [...editSteps];
                        copy[i] = e.target.value;
                        setEditSteps(copy);
                      }}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setEditSteps(editSteps.filter((_, j) => j !== i))
                      }
                    >
                      ✕
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditSteps([...editSteps, ""])}
                >
                  + Add Step
                </Button>
              </div>
            ) : article.steps.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No steps defined.
              </p>
            ) : (
              <ol className="space-y-3">
                {article.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        {/* Edit title field */}
        {editing && (
          <Card>
            <CardHeader>
              <CardTitle>Edit Title</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </CardContent>
          </Card>
        )}

        {/* Edit action buttons */}
        {editing && (
          <div className="flex gap-2">
            <Button
              onClick={saveEdit}
              disabled={saveLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {saveLoading ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setEditing(false)}
              disabled={saveLoading}
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            {article.tags.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No tags.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Update — hidden when editing */}
        {!editing && (
          <Card className="no-print">
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Current status: <strong>{article.status}</strong>.
                {userRole === "editor" && article.status === "Published" && (
                  <span className="text-red-600 ml-2">
                    This article is published and locked. Only admins can modify
                    it.
                  </span>
                )}
                {userRole === "editor" && article.status !== "Published" && (
                  <span className="text-amber-600 ml-2">
                    Editors can set Draft or Reviewed only.
                  </span>
                )}
              </p>
              <div className="flex gap-2 flex-wrap">
                {STATUS_ORDER.map((s) => {
                  if (s === "Published" && userRole === "editor") return null;
                  if (article.status === "Published" && userRole === "editor")
                    return null;
                  return (
                    <button
                      key={s}
                      onClick={() =>
                        setPendingStatus(s === article.status ? null : s)
                      }
                      className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                        s === article.status
                          ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                          : pendingStatus === s
                            ? "border-red-500 bg-red-50 text-red-700"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                      }`}
                      disabled={s === article.status}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              {pendingStatus && (
                <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 flex-1">
                    Change status from <strong>{article.status}</strong> to{" "}
                    <strong>{pendingStatus}</strong>?
                  </p>
                  <Button
                    size="sm"
                    onClick={confirmStatusChange}
                    disabled={statusLoading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {statusLoading ? "Saving..." : "Confirm"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPendingStatus(null)}
                    disabled={statusLoading}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Status History */}
        <Card>
          <CardHeader>
            <CardTitle>Status History</CardTitle>
          </CardHeader>
          <CardContent>
            {article.statusHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No history yet.
              </p>
            ) : (
              <div className="space-y-2">
                {article.statusHistory.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm py-1 border-b last:border-0"
                  >
                    <StatusBadge status={entry.status} />
                    <span className="text-muted-foreground">
                      {new Date(entry.changedAt).toLocaleString("en-MY")}
                    </span>
                    <span className="text-gray-600">
                      by <strong>{entry.by}</strong>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Raw Input */}
        {article.rawInput && (
          <Card>
            <CardHeader>
              <CardTitle>Original Raw Input</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border max-h-40 overflow-y-auto">
                {article.rawInput}
              </pre>
            </CardContent>
          </Card>
        )}

        <div className="pb-8 no-print">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            ← Back to Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
}
