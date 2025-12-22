"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

/** Extract text with pdf-parse (works on Vercel). */
export async function extractPdfTextFromBuffer(bytes: Uint8Array): Promise<string> {
  try {
    const pdfParse = await import("pdf-parse");
    const data = await pdfParse.default(Buffer.from(bytes));
    return (data?.text ?? "").trim();
  } catch (err) {
    console.error("pdf-parse failed:", err);
    return "";
  }
}

type GenOpts = {
  avoidQuestions?: string[];
  mode?: "default" | "regenerate";
  temperature?: number;
  minAnswerWords?: number;
  maxAnswerWords?: number;
  seed?: number;
};

/** Generates cards. Third `opts` arg is supported (to fix the “expected 1-2 args” error). */
export async function generateFlashcardsFromText(
  text: string,
  count = 10,
  opts: GenOpts = {}
) {
  const cleaned = collapseWhitespace(text);
  if (!cleaned) return [];

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return naiveCards(cleaned, count, opts.avoidQuestions);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = [
      "Create concise Q/A flashcards from the following document.",
      `Return exactly ${count} items in JSON array with fields "question" and "answer".`,
      opts.avoidQuestions?.length
        ? `Avoid these questions: ${JSON.stringify(opts.avoidQuestions)}.`
        : "",
      `Answers should be ${opts.minAnswerWords ?? 40}-${opts.maxAnswerWords ?? 120} words.`,
      "Document:",
      "```",
      cleaned.slice(0, 18000),
      "```",
    ]
      .filter(Boolean)
      .join("\n");

    const resp = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: opts.temperature ?? 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4000,
        // seed is not officially supported in all routes, but we still vary inputs via prompt anyway.
      },
    });

    const txt = resp.response.text();
    const parsed = tryParseCards(txt);
    if (Array.isArray(parsed) && parsed.length) return parsed.slice(0, count);

    // fallback if parsing fails
    return naiveCards(cleaned, count, opts.avoidQuestions);
  } catch (err) {
    console.error("Gemini generation failed:", err);
    return naiveCards(cleaned, count, opts.avoidQuestions);
  }
}

/* helpers */
function collapseWhitespace(s: string) {
  return String(s || "").replace(/\s+/g, " ").trim();
}
function tryParseCards(s: string) {
  try {
    const match = s.match(/\[[\s\S]*\]/);
    const json = JSON.parse(match ? match[0] : s);
    return (json as any[]).map((c) => ({
      question: String(c.question || "").trim().slice(0, 500),
      answer: String(c.answer || "").trim().slice(0, 1200),
    }));
  } catch {
    return null;
  }
}
function naiveCards(text: string, count: number, avoid?: string[]) {
  const banned = new Set((avoid ?? []).map((q) => q.toLowerCase()));
  const sentences = text.split(/(?<=[.?!])\s+/).filter(Boolean);
  const cards: { question: string; answer: string }[] = [];

  for (let i = 0; i < sentences.length && cards.length < count; i += 4) {
    const q = `What is: ${sentences[i].replace(/^[-•\d)\s]+/, "")}`.slice(0, 500);
    if (banned.has(q.toLowerCase())) continue;
    const answer = sentences.slice(i + 1, i + 4).join(" ").slice(0, 1000);
    if (answer) cards.push({ question: q, answer });
  }

  while (cards.length < count && sentences.length) {
    const i = Math.floor(Math.random() * sentences.length);
    const q = `Explain: ${sentences[i].slice(0, 120)}`.slice(0, 500);
    if (banned.has(q.toLowerCase())) continue;
    const answer = sentences.slice(i + 1, i + 3).join(" ").slice(0, 800) || "N/A";
    cards.push({ question: q, answer });
  }

  return cards.slice(0, count);
}