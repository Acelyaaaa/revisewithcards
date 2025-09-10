"use client";

import { useState } from "react";

type Props = {
  question: string;
  answer: string;
};

export default function Flashcard({ question, answer }: Props) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      onClick={() => setFlipped(!flipped)}
      className="w-full h-52 cursor-pointer perspective"
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 preserve-3d ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden bg-white border rounded-xl shadow p-4 flex items-center justify-center text-center text-gray-800 font-medium">
          {question}
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-rose-50 border rounded-xl shadow p-4 flex items-center justify-center text-center text-gray-900">
          {answer}
        </div>
      </div>
    </div>
  );
}
