export interface StructuredArticle {
  title: string;
  summary: string;
  steps: string[];
  tags: string[];
  category: string;
}

export async function processWithClaude(
  rawText: string,
): Promise<StructuredArticle> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.1,
      max_tokens: 1500,
      messages: [
        {
          role: "system",
          content: `You are a DHL Knowledge Base assistant that converts raw messy input into clean SOP articles.
The input may come from OCR scans, chat screenshots, emails, or handwritten notes and may contain garbled text, typos, or encoding errors.
Your job is to understand the INTENT of the message even if the text is scrambled, and produce a clean professional SOP.
Always respond with ONLY a valid JSON object. No markdown, no backticks, no explanation.`,
        },
        {
          role: "user",
          content: `Convert this raw input into a clean DHL SOP article. Even if the text looks garbled or has OCR errors, extract the key meaning and produce a professional article.

Return ONLY this exact JSON structure:
{
  "title": "short clear title describing the procedure",
  "summary": "2-3 sentence professional summary of what this SOP covers",
  "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
  "tags": ["tag1", "tag2", "tag3"],
  "category": "one of: Delivery / Returns / Damage / System / General"
}

Raw input:
${rawText}`,
        },
      ],
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(`OpenAI API error: ${data.error.message}`);

  const text: string = data.choices[0].message.content;
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean) as StructuredArticle;
}
