// lib/flashcard-generator.ts
import "server-only";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { loadPdfJs } from "./pdfjs-node";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  generationConfig: { temperature: 0.35 },
});

/**
 * Extract text from a PDF:
 * 1) Try pdf-parse (fast).
 * 2) If empty, fall back to pdfjs-dist with Node-safe polyfills.
 * Throws only when truly no text is embedded (image-only scans).
 */
export async function extractPdfTextFromBuffer(bytes: Uint8Array): Promise<string> {
  // ----- First pass: pdf-parse
  try {
    const pdfParse = await import("pdf-parse");
    const data = await pdfParse.default(Buffer.from(bytes));
    const text = (data?.text ?? "").trim();
    if (text) return text;
    // otherwise continue to pdf.js
  } catch {
    // ignore; fall through to pdf.js
  }

  // ----- Fallback: pdfjs-dist (Node safe)
  try {
    const pdfjsLib = await loadPdfJs();
    const loadingTask = pdfjsLib.getDocument({
      data: bytes,
      disableWorker: true,
      isEvalSupported: false,
      disableFontFace: true,
      disableRange: true,
      disableStream: true,
      useSystemFonts: true,
      maxImageSize: -1,
    });

    const pdf = await loadingTask.promise;
    const pages: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent({
          normalizeWhitespace: true,
          disableCombineTextItems: false,
        });
        const pageText = textContent.items
          .map((item: any) => (item?.str as string) || "")
          .join(" ");
        if (pageText.trim()) pages.push(pageText);
      } catch (e) {
        console.warn(`[pdfjs] failed to read page ${i}:`, e);
      }
    }

    const text = pages.join("\n\n").trim();
    if (!text) {
      throw new Error("No extractable text found in the PDF. If this is a scanned/image-only PDF, enable OCR.");
    }
    return text;
  } catch (err) {
    console.error("PDF extraction error:", err);
    throw new Error("Failed to extract text from PDF");
  }
}

export async function generateFlashcardsFromText(text: string, targetCount = 10) {
  try {
    if (!text || text.trim().length < 100) {
      throw new Error("Text content is too short to generate meaningful flashcards");
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1600,
      chunkOverlap: 200,
    });

    const chunks = await splitter.splitText(text || "");
    const excerpts = chunks.slice(0, 5).join("\n\n---\n\n");

    const prompt = `
You are an expert educational content creator specializing in high-quality study flashcards.

Create exactly ${targetCount} question & answer flashcards based ONLY on the text below.
Return ONLY a valid JSON array in this exact format:
[
  {"question":"...", "answer":"..."},
  {"question":"...", "answer":"..."}
]

Rules:
- Focus on conceptual understanding; avoid trivial recall.
- Answers should be clear and informative (2–5 sentences).
- No extra commentary or markdown.
- If context is missing, use: "Insufficient context in provided material".

Text:
${excerpts}
`;

    const result = await model.generateContent(prompt);
    const textResp = (await result.response.text())?.trim() ?? "[]";

    const jsonMatch = textResp.match(/\[\s*{[\s\S]*}\s*\]/);
    if (!jsonMatch) throw new Error("AI response format invalid");

    const cleaned = jsonMatch[0]
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();

    const flashcards = JSON.parse(cleaned);
    if (!Array.isArray(flashcards)) throw new Error("AI response is not an array");

    for (const card of flashcards) {
      if (!card?.question || !card?.answer) throw new Error("Invalid flashcard structure");
      card.question = String(card.question).trim().slice(0, 500);
      card.answer = String(card.answer).trim().slice(0, 1500);
    }

    return flashcards.slice(0, targetCount);
  } catch (error) {
    console.error("Flashcard generation error:", error);
    throw new Error("Failed to generate flashcards from text");
  }
}
