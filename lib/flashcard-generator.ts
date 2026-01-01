"use server";

import pdfParse from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAI } from "@google/generative-ai";

/* ===================== TYPES ===================== */

export type Flashcard = {
  question: string;
  answer: string;
};

export interface GenOptions {
  targetCount?: number;            // default 10
  avoidQuestions?: string[];       // used for regenerate
  minAnswerWords?: number;         // default 40
  maxAnswerWords?: number;         // default 120
  temperature?: number;            // default 0.3, 0.9 for regenerate
  mode?: "default" | "regenerate"; // regenerate shifts chunk window & increases variety
  seed?: number;                   // randomness control
}

/* ===================== DEFAULTS ===================== */

const DEFAULTS: Required<Omit<GenOptions, "avoidQuestions" | "seed">> = {
  targetCount: 10,
  minAnswerWords: 40,
  maxAnswerWords: 120,
  temperature: 0.3,
  mode: "default",
};

/* ===================== PDF EXTRACTION ===================== */
/** Vercel-safe: pdf-parse only, no native deps */
export async function extractPdfTextFromBuffer(
  bytes: Uint8Array
): Promise<string> {
  try {
    const data = await pdfParse(Buffer.from(bytes));
    return (data.text ?? "").trim();
  } catch (err) {
    console.error("PDF extraction failed:", err);
    throw new Error("Failed to extract text from PDF");
  }
}

/* ===================== HELPERS ===================== */

function extractJSONArray(raw: string): string | null {
  // Remove markdown code blocks
  let cleaned = raw.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
  
  // Try to find a complete JSON array
  const arrayMatch = cleaned.match(/\[[\s\S]*?\]/);
  if (arrayMatch) {
    return arrayMatch[0];
  }
  
  // If no complete array found, try to repair truncated JSON
  const startMatch = cleaned.match(/\[[\s\S]*/);
  if (startMatch) {
    let partial = startMatch[0];
    
    // Count open braces and brackets
    const openBraces = (partial.match(/\{/g) || []).length;
    const closeBraces = (partial.match(/\}/g) || []).length;
    const openBrackets = (partial.match(/\[/g) || []).length;
    const closeBrackets = (partial.match(/\]/g) || []).length;
    
    // Add missing closing characters
    for (let i = 0; i < openBraces - closeBraces; i++) {
      partial += '"}';
    }
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      partial += "]";
    }
    
    // Try to parse the repaired JSON
    try {
      JSON.parse(partial);
      return partial;
    } catch {
      
      return null;
    }
  }
  
  return null;
}

function sanitizeCards(cards: any[]): Flashcard[] {
  return cards
    .filter((c) => c?.question && c?.answer)
    .map((c) => ({
      question: String(c.question).trim().slice(0, 500),
      answer: String(c.answer).trim().slice(0, 1200),
    }))
    .filter((c) => c.question.length > 10 && c.answer.length > 20);
}



export async function generateFlashcardsFromText(
  fullText: string,
  targetCount = 10,
  opts: GenOptions = {}
): Promise<Flashcard[]> {
  if (!fullText || fullText.trim().length < 200) {
    throw new Error("Text too short to generate flashcards (minimum 200 characters)");
  }

  const {
    minAnswerWords,
    maxAnswerWords,
    temperature,
    mode,
    seed,
    avoidQuestions,
  } = { ...DEFAULTS, ...opts };

 
  const avoidSet = new Set(
    (avoidQuestions ?? []).map((q) => q.toLowerCase().trim())
  );

  /* ---- Chunk text ---- */
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000,
    chunkOverlap: 300,
  });

  const chunks = await splitter.splitText(fullText);

  /* ---- Regenerate = shift context window for variety ---- */
  const rand = seed ?? Math.floor(Math.random() * 1e9);
  const windowSize = 8;
  const startIndex =
    mode === "regenerate"
      ? rand % Math.max(1, chunks.length - windowSize)
      : 0;

  const context =
    chunks.slice(startIndex, startIndex + windowSize).join("\n\n---\n\n") ||
    fullText;

  /* ---- Gemini Configuration ---- */
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

 
  const isRegenerate = mode === "regenerate";
  
  const avoidBlock =
    avoidQuestions && avoidQuestions.length
      ? `
🚫 CRITICAL: DO NOT generate these questions (or paraphrases):
${avoidQuestions.slice(0, 10).map((q, i) => `${i + 1}. ${q}`).join("\n")}

Generate COMPLETELY DIFFERENT questions exploring OTHER aspects of the material.
`
      : "";

  const regenerateInstructions = isRegenerate
    ? `
🔄 REGENERATION MODE - IMPORTANT:
- Generate COMPLETELY NEW questions, NOT variations of previous ones
- Explore DIFFERENT topics, concepts, and angles from the document
- Use VARIED question formats: "How does...", "Why is...", "What are the implications of...", "Compare...", "Analyze..."
- Think creatively about what students should learn from THIS specific section
- Prioritize NOVELTY and DIVERSITY in your questions

Random Seed: ${rand}
`
    : `
📚 INITIAL GENERATION MODE:
- Focus on the MOST IMPORTANT concepts and key takeaways
- Cover main ideas, critical definitions, and fundamental principles
- Ensure questions test deep understanding of core material
`;

  const prompt = `
You are an expert educational content creator specializing in creating study flashcards for students.

${regenerateInstructions}

${avoidBlock}

TASK: Create EXACTLY ${targetCount} high-quality study flashcards from the text below.

CRITICAL OUTPUT REQUIREMENTS:
⚠️ You MUST return ONLY a valid JSON array
⚠️ NO markdown code blocks (no \`\`\`json)
⚠️ NO explanations or commentary
⚠️ Start with [ and end with ]
⚠️ Each flashcard must be complete with both question and answer

STRICT REQUIREMENTS:
✅ Return ONLY valid JSON array
✅ Each flashcard must have "question" and "answer" fields
✅ Questions must be clear, specific, and test understanding
✅ Answers must be ${minAnswerWords}-${maxAnswerWords} words long
✅ NO duplicate or paraphrased questions
✅ Use ONLY information from the provided text
✅ All questions must be unique and cover different aspects

OUTPUT FORMAT - Copy this structure EXACTLY:
[
  { "question": "Clear question here?", "answer": "Detailed answer in ${minAnswerWords}-${maxAnswerWords} words." }
]

DOCUMENT TEXT:
${context}

UNIQUENESS TOKEN: ${rand}

Return ONLY the JSON array (no markdown, no explanation):
`.trim();

  /* ---- Call Gemini API ---- */
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature,
      topK: isRegenerate ? 64 : 40,
      topP: isRegenerate ? 0.98 : 0.95,
      maxOutputTokens: 8192, // DOUBLED from 4096
    },
  });

  const raw = result.response.text()?.trim() ?? "";

  // Log for debugging regeneration issues
  if (isRegenerate) {
    console.log("Regeneration response length:", raw.length);
    console.log("Response starts with:", raw.slice(0, 50));
  }

  const json = extractJSONArray(raw);
  if (!json) {
    console.error("Invalid AI response length:", raw.length);
    console.error("Response preview:", raw.slice(0, 500));
    
    if (isRegenerate) {
      throw new Error("AI response was incomplete. Please try regenerating again.");
    }
    throw new Error("Invalid AI response format - no JSON array found");
  }

  let parsed: any[];
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    console.error("JSON parse error. Extracted JSON:", json.slice(0, 500));
    throw new Error("Failed to parse AI response as JSON");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("AI response is not an array");
  }

  /* ---- Sanitize + dedupe ---- */
  const cleaned = sanitizeCards(parsed).filter(
    (c) => !avoidSet.has(c.question.toLowerCase())
  );

  const out: Flashcard[] = [];
  const seen = new Set<string>();

  for (const c of cleaned) {
    const key = c.question.toLowerCase().slice(0, 100);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(c);
    }
    if (out.length >= targetCount) break;
  }

  if (out.length === 0) {
    throw new Error("No valid flashcards generated");
  }

  return out.slice(0, targetCount);
}

/* ---- Backward compatibility ---- */
export const generateFlashcards = generateFlashcardsFromText;