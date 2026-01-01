"use server";
import "server-only";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import {
  extractPdfTextFromBuffer,
  generateFlashcardsFromText,
} from "@/lib/flashcard-generator";
import { checkQuota, getQuotaStatus, incrementQuota } from "@/lib/quota";
import { rateLimit } from "@/lib/rate-limit";

export type Flashcard = { question: string; answer: string };

const flashcardGenerationLimiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

const FortyToOneTwenty = { min: 40, max: 120 };

type GenerateArgs = {
  fileUrl: string;
  fileName: string;
  count?: number;
  avoidQuestions?: string[];
  regenerate?: boolean;
};

export async function generateFlashcardsFromUrl({
  fileUrl,
  fileName,
  count = 10,
  avoidQuestions = [],
  regenerate = false,
}: GenerateArgs) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Unauthorized" };
    if (!fileUrl || !fileName) return { success: false, message: "Missing required parameters" };
    if (count > 10) return { success: false, message: "Count cannot exceed 10" };

    // basic rate limit
    const okRate = await flashcardGenerationLimiter.check(userId, 5);
    if (!okRate) return { success: false, message: "Rate limit exceeded. Please try again later." };

    // quota checks
    const okQuota = await checkQuota(userId);
    const status = await getQuotaStatus(userId);
    if (!okQuota) {
      return {
        success: false,
        message: `Quota exceeded. You've used ${status.current} of ${status.max}.`,
      };
    }

    if (!/^https:\/\//i.test(fileUrl)) return { success: false, message: "Invalid file URL" };

    // Always bypass caches so regenerate sees the latest file
    const res = await fetch(fileUrl, { cache: "no-store", next: { revalidate: 0 } });
    if (!res.ok) return { success: false, message: "Failed to download uploaded file" };

    const contentLength = res.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      return { success: false, message: "File size exceeds 10MB limit" };
    }

    const bytes = new Uint8Array(await res.arrayBuffer());
    const text = await extractPdfTextFromBuffer(bytes);
    if (!text.trim()) return { success: false, message: "Could not extract text from PDF" };

    // RETRY LOGIC FOR REGENERATION
    let cards;
    let attempts = 0;
    const maxAttempts = regenerate ? 2 : 1; // Retry twice for regeneration
    
    while (attempts < maxAttempts) {
      try {
        const seed = Math.floor(Math.random() * 2_147_483_647) + attempts;
        
        cards = await generateFlashcardsFromText(text, count, {
          avoidQuestions: Array.from(new Set(avoidQuestions)),
          mode: regenerate ? "regenerate" : "default",
          temperature: regenerate ? 0.9 : 0.35,
          minAnswerWords: FortyToOneTwenty.min,
          maxAnswerWords: FortyToOneTwenty.max,
          seed,
        });
        
        // If we got valid cards, break out of retry loop
        if (cards && cards.length > 0) {
          break;
        }
      } catch (e: any) {
        attempts++;
        console.error(`Generation attempt ${attempts} failed:`, e.message);
        
        // If this is the last attempt, throw the error
        if (attempts >= maxAttempts) {
          throw e;
        }
        
        // Wait a bit before retrying (only for regeneration)
        if (regenerate) {
          console.log(`Retrying regeneration (attempt ${attempts + 1}/${maxAttempts})...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    if (!cards || cards.length === 0) {
      return { success: false, message: "Failed to generate flashcards" };
    }

    // Premium regenerates do NOT count; free regenerates DO.
    if (!(status.plan === "premium" && regenerate)) {
      await incrementQuota(userId);
    }

    return { success: true, data: { fileName, cards, fileUrl } };
  } catch (e: any) {
    console.error("Error generating flashcards:", e);
    return { 
      success: false, 
      message: e.message || "An unexpected error occurred" 
    };
  }
}

export async function saveFlashcardsAction(params: { fileName: string; cards: Flashcard[] }) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, message: "Unauthorized" };

    if (!params.fileName || !params.cards || !Array.isArray(params.cards)) {
      return { success: false, message: "Invalid input parameters" };
    }
    if (params.cards.length > 10) {
      return { success: false, message: "Too many flashcards" };
    }

    const sanitized = params.cards.map((c) => ({
      question: c.question.slice(0, 500).trim(),
      answer: c.answer.slice(0, 1200).trim(),
    }));

    const saved = await sql`
      INSERT INTO user_flashcards (userId, fileName, fileUrl, flashcards)
      VALUES (${userId}, ${params.fileName.slice(0, 255)}, '', ${JSON.stringify(sanitized)})
      RETURNING *
    `;
    revalidatePath("/summaries");
    const row = Array.isArray(saved) ? saved[0] : saved;
    return { success: true, data: { id: row?.id ?? "unknown" } };
  } catch (e: any) {
    console.error("Error saving flashcards:", e);
    return { success: false, message: e.message || "Failed to save flashcards" };
  }
}

export async function regenerateFlashcardsAction(
  fileUrl: string,
  fileName: string,
  count = 10,
  previousQuestions: string[] = []
) {
  return generateFlashcardsFromUrl({
    fileUrl,
    fileName,
    count,
    avoidQuestions: previousQuestions,
    regenerate: true,
  });
}