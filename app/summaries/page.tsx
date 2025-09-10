import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import Link from "next/link";

type Row = {
  id: number;
  fileName: string;
  createdAt: string;
  cardCount: number;
};

export default async function SummariesPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Your summaries</h1>
        <p className="text-gray-600">Please sign in to view saved flashcards.</p>
      </div>
    );
  }

  const rows = (await sql`
    SELECT
      id,
      filename as "fileName",
      createdat as "createdAt",
      jsonb_array_length(flashcards) as "cardCount"
    FROM user_flashcards
    WHERE userid = ${userId}
    ORDER BY createdat DESC
  `) as unknown as Row[];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your summaries</h1>
        <p className="text-gray-600 mt-2">
          Saved flashcard batches from your uploaded PDFs.
        </p>
      </div>

      {(!rows || rows.length === 0) ? (
        <div className="rounded-2xl border p-10 text-center">
          <p className="text-gray-600 mb-4">No summaries yet.</p>
          <Link
            href="/upload"
            className="inline-flex items-center rounded-xl px-4 py-2 bg-gradient-to-r from-slate-900 to-rose-500 text-white hover:from-rose-500 hover:to-slate-900 transition"
          >
            Upload a PDF
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rows.map((r) => (
            <Link
              key={r.id}
              href={`/summaries/${r.id}`}
              className="group rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition hover:border-rose-300"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold line-clamp-2 group-hover:text-rose-600">
                  {r.fileName || "Untitled.pdf"}
                </h3>
                <span className="text-xs px-2 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  {r.cardCount} cards
                </span>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Saved {new Date(r.createdAt).toLocaleString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
