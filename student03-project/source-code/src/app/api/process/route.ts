import { NextResponse } from "next/server";
import { processWithClaude } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const cleanBody = body.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ");
    const parsed = JSON.parse(cleanBody);
    const { rawText, source } = parsed;

    if (!rawText?.trim()) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const cleanText = rawText
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 2000);

    const structured = await processWithClaude(cleanText);
    return NextResponse.json({
      ...structured,
      rawInput: cleanText,
      source: source ?? "manual-upload",
    });
  } catch (error) {
    console.error("Process route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
