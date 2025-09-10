"use server";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type Flashcard = { question: string; answer: string };

function sanitizeFileName(name: string, ext: string) {
  const base =
    (name || "flashcards").replace(/[^\w\s.-]/g, "").trim() || "flashcards";
  return base.toLowerCase().endsWith(ext) ? base : `${base}${ext}`;
}


function buildMarkdown(fileName: string, cards: Flashcard[]) {
  const title = `# ${fileName.replace(/\.(pdf|md)$/i, "")} — Flashcards\n\n`;
  const body = (cards || [])
    .map(
      (c, i) =>
        `## Q${i + 1}. ${c.question}\n\n**Answer:** ${c.answer}\n`
    )
    .join("\n");
  return `${title}${body}`;
}


function wrapLines(
  text: string,
  font: any,
  size: number,
  maxWidth: number
): string[] {
  const words = String(text || "").split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const w of words) {
    const test = line ? line + " " + w : w;
    const width = font.widthOfTextAtSize(test, size);
    if (width <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}


async function buildPdf(fileName: string, cards: Flashcard[]) {
  const pdf = await PDFDocument.create();

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  
  const pageSize = { w: 595.28, h: 841.89 };
  const margin = 50;
  const contentWidth = pageSize.w - margin * 2;

  let page = pdf.addPage([pageSize.w, pageSize.h]);
  let x = margin;
  let y = page.getHeight() - margin;

  const titleSize = 20;
  const qSize = 14;
  const aSize = 12;
  const lineGap = 6;

  const addPage = () => {
    page = pdf.addPage([pageSize.w, pageSize.h]);
    x = margin;
    y = page.getHeight() - margin;
  };

 
  const title = `${fileName.replace(/\.(pdf|md)$/i, "")} — Flashcards`;
  const titleLines = wrapLines(title, bold, titleSize, contentWidth);
  for (const tl of titleLines) {
    page.drawText(tl, { x, y, size: titleSize, font: bold, color: rgb(0, 0, 0) });
    y -= titleSize + lineGap;
  }
  y -= 8;

  
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];

    
    const qText = `Q${i + 1}. ${c.question}`;
    const qLines = wrapLines(qText, bold, qSize, contentWidth);

   
    if (y - (qLines.length * (qSize + 2) + 20) < margin) addPage();

    for (const line of qLines) {
      page.drawText(line, { x, y, size: qSize, font: bold });
      y -= qSize + 2;
    }
    y -= 4;

    
    const aPrefix = "Answer: ";
    const aLines = wrapLines(`${aPrefix}${c.answer}`, font, aSize, contentWidth);
    for (const line of aLines) {
      if (y - (aSize + 2) < margin) addPage();
      page.drawText(line, { x, y, size: aSize, font });
      y -= aSize + 2;
    }

    
    y -= 10;
    if (i < cards.length - 1) {
      if (y - 8 < margin) addPage();
      page.drawLine({
        start: { x, y },
        end: { x: page.getWidth() - margin, y },
        thickness: 0.5,
        color: rgb(0.85, 0.85, 0.85),
      });
      y -= 16;
    }
  }

  const bytes = await pdf.save(); 
  return Buffer.from(bytes);
}


export async function exportFlashcardsToMarkdown(params: {
  fileName: string;
  cards: Flashcard[];
}) {
  const fileName = sanitizeFileName(params.fileName || "flashcards", ".md");
  const md = buildMarkdown(fileName, params.cards || []);
  const base64 = Buffer.from(md, "utf8").toString("base64");
  return { filename: fileName, mime: "text/markdown", base64 };
}


export async function exportFlashcardsToPdf(params: {
  fileName: string;
  cards: Flashcard[];
}) {
  const fileName = sanitizeFileName(params.fileName || "flashcards", ".pdf");
  const pdfBuf = await buildPdf(fileName, params.cards || []);
  const base64 = pdfBuf.toString("base64");
  return { filename: fileName, mime: "application/pdf", base64 };
}
