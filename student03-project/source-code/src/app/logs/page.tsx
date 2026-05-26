"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";

interface Log {
  id: string;
  message: string;
  level: string;
  createdAt: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/logs", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setLogs(Array.isArray(data) ? data.reverse() : []));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">UiPath Run Logs</h1>
        {logs.length === 0 ? (
          <p className="text-muted-foreground text-center py-20">
            No logs yet. Run UiPath to generate reports.
          </p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <Card key={log.id}>
                <CardContent className="py-3">
                  <div className="flex items-start justify-between gap-4">
                    <pre className="text-xs whitespace-pre-wrap flex-1">
                      {log.message}
                    </pre>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("en-MY")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
