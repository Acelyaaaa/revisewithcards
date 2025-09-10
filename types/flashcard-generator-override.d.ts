declare module "@/lib/flashcard-generator" {
  export type Card = { question: string; answer: string };
  export function extractPdfTextFromBuffer(bytes: Uint8Array): Promise<string>;
  // widen to accept the 3rd options arg
  export function generateFlashcardsFromText(
    text: string,
    count?: number,
    opts?: any
  ): Promise<Card[]>;
}
