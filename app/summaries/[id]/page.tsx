import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import { notFound } from "next/navigation";
import FlashcardGrid from "@/components/flashcards/flashcard-grid";
import Link from "next/link";

type Row = {
  id: number;
  fileName: string;
  flashcards: { question: string; answer: string }[];
  createdAt: string;
};

export default async function SummaryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();
  if (!userId) notFound();

  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  
  const result = (await sql`
    SELECT
      id,
      filename as "fileName",
      flashcards,
      createdat as "createdAt"
    FROM user_flashcards
    WHERE id = ${id} AND userid = ${userId}
    LIMIT 1
  `) as unknown as Row[];

  const row = result?.[0];
  if (!row) notFound();

  const cards = Array.isArray(row.flashcards) ? row.flashcards : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/summaries" className="hover:text-rose-600">
            Your summaries
          </Link>
          <span>/</span>
          <span>{row.fileName || "Untitled.pdf"}</span>
        </div>
        <h1 className="text-3xl font-bold mt-2">
          {row.fileName || "Untitled.pdf"}
        </h1>
        <p className="text-gray-600 mt-1">
          Saved {new Date(row.createdAt).toLocaleString()}
        </p>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-2xl border p-10 text-center text-gray-600">
          No flashcards found in this batch.
        </div>
      ) : (
        <div className="rounded-2xl border p-6 bg-white shadow-sm">
          <FlashcardGrid cards={cards} />
        </div>
      )}
    </div>
  );
}
