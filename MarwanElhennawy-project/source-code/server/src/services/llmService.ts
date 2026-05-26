import axios from "axios";

interface StructuredKB {
  title: string;
  summary: string;
  steps: string[];
  roles: string[];
  keyPoints: string[];
  risks: string[];
  notes: string;
}

// Try to repair broken JSON from LLM output
const repairJson = (text: string): string => {
  let cleaned = text.trim();

  // Remove markdown/code fences
  cleaned = cleaned.replace(/```json/g, "");
  cleaned = cleaned.replace(/```/g, "");

  // Find JSON start
  const start = cleaned.indexOf("{");
  if (start !== -1) {
    cleaned = cleaned.slice(start);
  }

  // Find last closing brace
  const end = cleaned.lastIndexOf("}");
  if (end !== -1) {
    cleaned = cleaned.slice(0, end + 1);
  }

  return cleaned.trim();
};

// Safe JSON parse with fallback
const safeParseKB = (jsonText: string, rawText: string): StructuredKB => {
  try {
    const parsed = JSON.parse(jsonText);

    return {
      title:
        parsed.title?.trim() ||
        rawText.slice(0, 60) ||
        "Untitled Incident Report",

      summary: parsed.summary?.trim() || "No summary generated.",

      steps: Array.isArray(parsed.steps)
        ? parsed.steps.filter(Boolean)
        : [],

      roles: Array.isArray(parsed.roles)
        ? parsed.roles.filter(Boolean)
        : [],

      keyPoints: Array.isArray(parsed.keyPoints)
        ? parsed.keyPoints.filter(Boolean)
        : [],

      risks: Array.isArray(parsed.risks)
        ? parsed.risks.filter(Boolean)
        : [],

      notes: parsed.notes?.trim() || "",
    };
  } catch (error) {
    console.error("❌ JSON parse failed:", error);

    // Better fallback — no same fake title every time
    return {
      title:
        rawText
          .split("\n")
          .find((line) => line.trim().length > 10)
          ?.slice(0, 80) || "Untitled Incident Report",

      summary: rawText.slice(0, 300),

      steps: [],
      roles: [],
      keyPoints: [],
      risks: [],

      notes: "Model returned invalid JSON",
    };
  }
};

export const generateStructuredKB = async (
  rawText: string
): Promise<StructuredKB> => {
  try {
    let trimmedText = rawText;

    // New laptop = allow bigger input
    const MAX_LENGTH = 4000;

    if (trimmedText.length > MAX_LENGTH) {
      trimmedText = trimmedText.slice(0, MAX_LENGTH);
    }

    console.log("🧠 Sending request to Phi3...");
    console.log("📄 Input length:", trimmedText.length);

    const prompt = `
You are a DHL logistics knowledge base formatter.

TASK:
Convert raw operational text into structured JSON.

STRICT RULES:
- Output ONLY valid JSON
- No markdown
- No explanations
- No text outside JSON
- Keep responses concise
- Use short bullet-like sentences
- NEVER leave required fields blank

Return EXACTLY this format:

{
  "title": "",
  "summary": "",
  "steps": [],
  "roles": [],
  "keyPoints": [],
  "risks": [],
  "notes": ""
}

FIELD RULES:
- title: short professional incident title
- summary: max 2 sentences
- steps: max 5 short actionable steps
- roles: max 4 roles
- keyPoints: max 4 important facts
- risks: max 4 operational risks
- notes: short optional note

RAW TEXT:
${trimmedText}
`;

    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "phi3",
      prompt,
      stream: false,

      options: {
        temperature: 0.1,
        top_p: 0.9,
        num_predict: 1000,
        num_ctx: 8192,
      },
    });

    const rawOutput = response.data.response || "";

    console.log("📤 Raw Phi3 output:");
    console.log(rawOutput);

    const repaired = repairJson(rawOutput);

    console.log("🛠 Repaired JSON:");
    console.log(repaired);

    return safeParseKB(repaired, rawText);
  } catch (error: any) {
    console.error("❌ LLM request failed:", error.message);

    return {
      title:
        rawText
          .split("\n")
          .find((line) => line.trim().length > 10)
          ?.slice(0, 80) || "Untitled Incident Report",

      summary: rawText.slice(0, 300),

      steps: [],
      roles: [],
      keyPoints: [],
      risks: [],

      notes: "LLM service failed",
    };
  }
};