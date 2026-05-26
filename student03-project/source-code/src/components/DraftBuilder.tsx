"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { StructuredArticle } from "@/lib/gemini";

interface Props {
  draft: StructuredArticle & { rawInput: string };
  onSave: (d: StructuredArticle & { rawInput: string }) => void;
}

export default function DraftBuilder({ draft, onSave }: Props) {
  const [title, setTitle] = useState(draft.title);
  const [summary, setSummary] = useState(draft.summary);
  const [steps, setSteps] = useState<string[]>(draft.steps);
  const [tags, setTags] = useState<string[]>(draft.tags);
  const [tagInput, setTagInput] = useState(draft.tags.join(", "));

  return (
    <Card className="mt-6 border-2 border-red-200">
      <CardHeader>
        <CardTitle className="text-red-600">
          ✦ AI-Proposed Draft — Review before saving
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Summary</Label>
          <Textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Steps</Label>
          {steps.map((step, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="mt-2 text-xs text-muted-foreground w-5">
                {i + 1}.
              </span>
              <Input
                value={step}
                onChange={(e) => {
                  const copy = [...steps];
                  copy[i] = e.target.value;
                  setSteps(copy);
                }}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSteps(steps.filter((_, j) => j !== i))}
              >
                ✕
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSteps([...steps, ""])}
          >
            + Add Step
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Tags (comma separated)</Label>
          <Input
            value={tagInput}
            onChange={(e) => {
              setTagInput(e.target.value);
              setTags(
                e.target.value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
              );
            }}
            placeholder="delivery, complaint, SOP"
          />
          <div className="flex flex-wrap gap-1 mt-1">
            {tags.map((t) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          onClick={() =>
            onSave({
              title,
              summary,
              steps,
              tags,
              category: draft.category,
              rawInput: draft.rawInput,
            })
          }
          className="bg-red-600 hover:bg-red-700 w-full"
        >
          Save as Draft
        </Button>
      </CardContent>
    </Card>
  );
}
