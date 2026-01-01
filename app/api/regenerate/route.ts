import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { checkQuota, getQuotaStatus, incrementQuota } from "@/lib/quota";
import {
  extractPdfTextFromBuffer,
  generateFlashcardsFromText,
} from "@/lib/flashcard-generator";

const Body = z.object({
  fileUrl: z.string().url(),
  count: z.number().int().min(1).max(10).optional(),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ok = await checkQuota(userId);
  if (!ok) {
    const q = await getQuotaStatus(userId);
    return NextResponse.json(
      { error: `Quota exceeded. Used ${q.current}/${q.max}.` },
      { status: 429 }
    );
  }

  const { fileUrl, count = 10 } = Body.parse(await req.json());
  if (!/^https:\/\//i.test(fileUrl)) {
    return NextResponse.json({ error: "Invalid file URL" }, { status: 400 });
  }

  const res = await fetch(fileUrl, { cache: "no-store", next: { revalidate: 0 } });
  if (!res.ok) return NextResponse.json({ error: "Failed to download file" }, { status: 400 });

  const contentLength = res.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 400 });
  }

  const buf = new Uint8Array(await res.arrayBuffer());
  const text = await extractPdfTextFromBuffer(buf);
  if (!text.trim()) return NextResponse.json({ error: "Empty PDF text" }, { status: 400 });

  // Use random seed to vary results even through the API
  const flashcards = await generateFlashcardsFromText(text, count, {
    temperature: 0.4,
    seed: Math.floor(Math.random() * 2_147_483_647),
  });

  await incrementQuota(userId);
  return NextResponse.json({ flashcards });
}