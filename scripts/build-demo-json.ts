// scripts/build-demo-json.ts
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { extractPdfTextFromBuffer, generateFlashcardsFromText } from "../lib/flashcard-generator";

async function main() {
  const pdfPath = path.join(process.cwd(), "public/demo/academic.pdf");
  const outPath = path.join(process.cwd(), "public/demo/flashcards.json");

  const bytes = new Uint8Array(readFileSync(pdfPath));
  const text = await extractPdfTextFromBuffer(bytes);

  const cards = await generateFlashcardsFromText(text, 10, {
    
    minAnswerWords: 40,
    maxAnswerWords: 120,
    temperature: 0.4,
  });

  writeFileSync(outPath, JSON.stringify(cards, null, 2));
  console.log(`✅ Wrote ${outPath} (${cards.length} cards)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
