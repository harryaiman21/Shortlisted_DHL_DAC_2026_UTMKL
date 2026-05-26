export function formatArticle(rawText: string) {
  const cleaned = rawText
    .replace(/\s+/g, " ")
    .trim();

  return {
    title: generateTitle(cleaned),
    summary: generateSummary(cleaned),
    content: generateStructuredContent(cleaned),
  };
}

function generateTitle(text: string) {
  return text.slice(0, 60).split(".")[0] || "Untitled Article";
}

function generateSummary(text: string) {
  return text.slice(0, 200) + "...";
}

function generateStructuredContent(text: string) {
  return `
## Summary
${generateSummary(text)}

## Full Content
${text}

## Key Points
- Extracted from raw input
- Processed via system pipeline
- Ready for knowledge base
  `;
}