"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Shuffle, RotateCcw } from "lucide-react";
import ExportButtons from "@/components/flashcards/export-buttons";

export type Card = { question: string; answer: string };

export default function FlashcardGrid({
  cards,
  fileName = "Flashcards",
  onRegenerate,
}: {
  cards: Card[];
  fileName?: string;
  onRegenerate?: () => void;
}) {
  const [idx, setIdx] = useState(0);

 
  useEffect(() => {
    setIdx(0);
  }, [cards]);

  const total = cards.length;
  const canPrev = idx > 0;
  const canNext = idx < total - 1;

  const prev = () => setIdx((i) => Math.max(i - 1, 0));
  const next = () => setIdx((i) => Math.min(i + 1, total - 1));
  const random = () => setIdx(Math.floor(Math.random() * total));

  const card = cards[idx];

  return (
    <div className="w-full max-w-2xl mx-auto">
      
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={prev} disabled={!canPrev} className="gap-1">
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <Button onClick={next} disabled={!canNext} className="gap-1">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={random} className="gap-1">
            <Shuffle className="h-4 w-4" /> Random
          </Button>
          {onRegenerate && (
            <Button variant="ghost" onClick={onRegenerate} className="gap-1">
              <RotateCcw className="h-4 w-4" /> Regenerate
            </Button>
          )}
        </div>
        <ExportButtons fileName={fileName} cards={cards} />
      </div>

      {/* Progress */}
      <div className="mb-3 text-sm text-gray-500 text-center">
        {idx + 1} / {total}
      </div>

      {/* Card */}
      <Flashcard question={card.question} answer={card.answer} />
    </div>
  );
}

function Flashcard({ question, answer }: Card) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      onClick={() => setFlipped((s) => !s)}
      className="relative w-full h-64 cursor-pointer perspective"
    >
      <div
        className={`relative h-full w-full transition-transform duration-700 preserve-3d ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden flex flex-col justify-center items-center bg-white border rounded-xl shadow-md p-6">
          <p className="text-gray-900 text-lg font-medium text-center">{question}</p>
          <p className="mt-3 text-xs text-gray-400">Click to reveal answer</p>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col justify-center items-center bg-rose-50 border rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 mb-2">Answer</p>
          <p className="text-gray-900 font-medium text-center">{answer}</p>
        </div>
      </div>
    </div>
  );
}
