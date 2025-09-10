"use client";
import { useState } from "react";

export default function Flashcard({ question, answer }: { question: string; answer: string }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      onClick={() => setFlipped(!flipped)}
      className="w-64 h-40 cursor-pointer perspective"
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        <div className="absolute w-full h-full flex items-center justify-center bg-white border rounded-2xl shadow-xl backface-hidden p-4 text-center">
          <p className="text-lg font-semibold">{question}</p>
        </div>

        <div className="absolute w-full h-full flex items-center justify-center bg-blue-100 border rounded-2xl shadow-xl backface-hidden p-4 text-center rotate-y-180">
          <p className="text-base">{answer}</p>
        </div>
      </div>
    </div>
  );
}
