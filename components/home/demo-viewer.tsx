"use client";

import { useEffect, useState } from "react";
import FlashcardGrid from "@/components/flashcards/flashcard-grid";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles } from "lucide-react";

type Card = { question: string; answer: string };

const DEMO_PDF = "/demo/academic.pdf";
const DEMO_JSON = "/demo/flashcards.json";


const FALLBACK: Card[] = [
  { question: "What is the core goal of user-centered design?", answer: "To place users’ needs, goals, and context at the center of the design process so that systems are understandable, efficient, and satisfying. It emphasizes iterative feedback, observation, and evaluation with real users throughout ideation, prototyping, and delivery to improve usability and real-world fit." },
  { question: "Name two typical UCD activities.", answer: "User research (interviews, contextual inquiry) and iterative evaluation (usability testing, think-aloud studies). These pair with artifacts such as personas, scenarios, and low/high-fidelity prototypes to align product decisions with user behaviors and goals." },
  { question: "Why do teams iterate in UCD?", answer: "Iteration reduces risk by revealing gaps early, validates assumptions with evidence, and lets designers refine flows, copy, and interaction patterns based on observed behavior rather than speculation. This raises usability and adoption while lowering rework costs." },
  { question: "How do personas help design?", answer: "Personas synthesize research into representative user archetypes—goals, pain points, constraints—which align the team on who they are designing for. They guide prioritization, scenario creation, and acceptance criteria, preventing feature creep and designer bias." },
  { question: "What is a usability test's main output?", answer: "Observed issues prioritized by severity and impact, along with actionable findings that inform design changes. Metrics such as task success rate, time on task, error counts, and SUS/UMUX-Lite scores quantify improvements across iterations." },
  { question: "How does context of use affect requirements?", answer: "Environment, devices, and constraints (e.g., noisy field settings, low bandwidth, small screens) shape navigation depth, input methods, error handling, and content density. UCD captures these factors early to produce resilient designs that work in situ." },
  { question: "Explain formative vs. summative evaluation.", answer: "Formative testing happens during design to discover problems and guide improvements; summative testing evaluates a near-final solution to judge if it meets benchmarks (e.g., success rate ≥ 90%). Both complement analytics after launch for continuous improvement." },
  { question: "How does accessibility align with UCD?", answer: "Accessibility ensures products are usable by people with diverse abilities through semantics, contrast, keyboard interaction, captions, and alternatives. It’s integral to UCD since it broadens reach, improves quality for everyone, and often aligns with legal standards." },
  { question: "What artifacts support stakeholder alignment?", answer: "Personas, journey maps, service blueprints, annotated wireframes, and prototypes. These make user evidence shareable, anchor decisions in research, and reduce miscommunication between design, product, and engineering." },
  { question: "Give two risks of skipping UCD.", answer: "Building features no one needs and shipping interfaces that create friction or errors. This leads to low adoption, high support costs, and expensive rework. UCD mitigates these by grounding decisions in real user evidence." }
];

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function DemoViewer() {
  const [all, setAll] = useState<Card[]>([]);
  const [cards, setCards] = useState<Card[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(DEMO_JSON)
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then((data: Card[]) => setAll(data))
      .catch(() => setAll(FALLBACK));
  }, []);

  async function generate() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    setCards(shuffle(all).slice(0, 10));
    setLoading(false);
  }

  async function regenerate() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 350));
    setCards(shuffle(all).slice(0, 10));
    setLoading(false);
  }

  return (
    <div className="w-full">
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* PDF preview */}
        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="font-medium">Sample academic PDF</div>
            <a
              href={DEMO_PDF}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-rose-600 hover:underline"
            >
              Open full PDF
            </a>
          </div>
          <div className="aspect-[4/5] bg-gray-50">
            <iframe
              title="Demo PDF"
              src={`${DEMO_PDF}#toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Flashcards */}
        <div className="rounded-2xl border bg-white shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-medium">Flashcards (demo)</div>
            <div className="flex gap-2">
              <Button type="button" onClick={generate} disabled={!all.length || loading} className="gap-2">
                <Sparkles size={16} />
                {cards ? "Generate again" : "Generate demo"}
              </Button>
              <Button type="button" variant="outline" onClick={regenerate} disabled={!cards || loading} className="gap-2">
                <RefreshCw size={16} />
                Regenerate
              </Button>
            </div>
          </div>

          {!cards && !loading && (
            <p className="text-sm text-gray-600">
              Click <span className="font-medium">Generate demo</span> to see 10 flashcards from the PDF (no sign-in).
            </p>
          )}

          {loading && (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-4/6" />
              <div className="h-4 bg-gray-200 rounded w-3/6" />
            </div>
          )}

          {cards && !loading && (
            <div className="mt-2">
              <FlashcardGrid cards={cards} />
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Demo uses a local open-access PDF.
        When signed in, your own PDFs are processed with a more powerful AI model. 
        Own documents, notes and lecture notes can be used. 
      </p>
    </div>
  );
}
