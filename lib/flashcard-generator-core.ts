// NO "server-only" import here on purpose.
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ---- Types
export type Flashcard = { question: string; answer: string };

export interface GenOptions {
  targetCount?: number;            // default 10
  avoidQuestions?: string[];       // for regenerate variety
  minAnswerWords?: number;         // default 40
  maxAnswerWords?: number;         // default 120
  temperature?: number;            // default 0.3
  mode?: "default" | "regenerate"; // affects randomness
  seed?: number;                   // optional nonce
}

const DEFAULTS: Required<Omit<GenOptions, "avoidQuestions" | "seed">> = {
  targetCount: 10,
  minAnswerWords: 40,
  maxAnswerWords: 120,
  temperature: 0.3,
  mode: "default",
};

// ---- Helpers
function extractJSONArray(raw: string): string | null {
  const m = raw.match(/\[\s*{[\s\S]*}\s*\]/);
  return m ? m[0] : null;
}
function sanitizeCards(cards: any[]): Flashcard[] {
  return cards
    .filter((c) => c?.question && c?.answer)
    .map((c) => ({
      question: String(c.question).trim().slice(0, 500),
      answer: String(c.answer).trim().slice(0, 1200),
    }));
}

// ---- PDF text extraction (works in Node)
export async function extractPdfTextFromBuffer(bytes: Uint8Array): Promise<string> {
  try {
    try {
      const pdfParse = await import("pdf-parse");
      const data = await pdfParse.default(Buffer.from(bytes));
      if (data?.text && data.text.trim().length > 0) return data.text;
      throw new Error("pdf-parse returned empty text");
    } catch {
      const pdfjsLib: any = await import("pdfjs-dist/legacy/build/pdf.js");
      if (pdfjsLib?.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "";
      }
      const loadingTask = pdfjsLib.getDocument({
        data: bytes,
        disableWorker: true,
        isEvalSupported: false,
        disableFontFace: true,
        useSystemFonts: true,
        disableCreateObjectURL: true,
        disableStream: true,
      });
      const pdf = await loadingTask.promise;
      const pages: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        pages.push(textContent.items.map((it: any) => it.str || "").join(" "));
      }
      return pages.join("\n\n");
    }
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

// ---- Flashcard generation (Gemini)
export async function generateFlashcardsFromText(
  fullText: string,
  targetCount = 10,
  opts: GenOptions = {}
): Promise<Flashcard[]> {
  if (!fullText || fullText.trim().length < 100) {
    throw new Error("Text content is too short to generate meaningful flashcards");
  }

  const {
    minAnswerWords,
    maxAnswerWords,
    temperature,
    mode,
    seed,
    targetCount: tcount,
    avoidQuestions,
  } = { ...DEFAULTS, ...opts, targetCount };

  const avoidSet = new Set(
    (avoidQuestions ?? []).map((q) => q.trim().toLowerCase()).filter(Boolean)
  );

  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1600, chunkOverlap: 200 });
  const chunks = await splitter.splitText(fullText);

  const rand = seed ?? Math.floor(Math.random() * 1e9);
  const windowSize = 6;
  const startIndex =
    mode === "regenerate"
      ? Math.max(0, Math.floor((rand % Math.max(1, chunks.length - windowSize))))
      : 0;

  const excerpts = chunks.slice(startIndex, startIndex + windowSize).join("\n\n---\n\n") || fullText;

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment");
  }
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig: { temperature },
  });

  const avoidList =
    avoidQuestions && avoidQuestions.length
      ? `Avoid overlapping with ANY of these existing questions (no paraphrases either):
${avoidQuestions.map((q) => `- ${q}`).join("\n")}
`
      : "";

  const prompt = `
You are an expert educational content creator.

Create EXACTLY ${tcount} *new* high-quality Q&A flashcards based ONLY on the provided text.

${avoidList}

Return ONLY a valid JSON array (no backticks, no commentary), like:
[
  {"question":"...", "answer":"..."},
  ...
]

Rules:
- New and diverse questions that test conceptual understanding (not trivial recall)
- No duplicates or paraphrases of the avoid list or within the set
- Answers should be informative and STUDY-FRIENDLY: between ${minAnswerWords} and ${maxAnswerWords} words (aim near the middle)
- Use only information from the provided text
- No markdown, no extra text

TEXT:
${excerpts}

RANDOM_NONCE: ${rand}
`;

  const result = await model.generateContent(prompt);
  const raw = (await result.response.text())?.trim() ?? "[]";
  const json = extractJSONArray(raw);
  if (!json) throw new Error("AI response format invalid");

  let parsed: any[];
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    console.error("JSON parse error:", e, "Raw:", raw);
    throw new Error("Failed to parse AI response");
  }

  const cleaned = sanitizeCards(parsed).filter((c) => !avoidSet.has(c.question.toLowerCase()));

  // Deduplicate within the new set
  const out: Flashcard[] = [];
  const seen = new Set<string>();
  for (const c of cleaned) {
    const key = c.question.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(c);
    }
    if (out.length >= tcount) break;
  }
  return out.slice(0, tcount);
}

// Legacy alias (some imports in your app might use this name)
export const generateFlashcards = generateFlashcardsFromText;
