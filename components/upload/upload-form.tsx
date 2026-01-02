"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import UploadFormInput from "@/components/upload/upload-form-input";
import FlashcardGrid from "@/components/flashcards/flashcard-grid";
import { useUploadThing } from "@/utils/uploadthings";
import {
  generateFlashcardsFromUrl,
  saveFlashcardsAction,
  regenerateFlashcardsAction,
} from "@/actions/flashcard-actions";
import { Button } from "@/components/ui/button";
import { Save, RefreshCw, Upload, AlertCircle } from "lucide-react";

type Card = { question: string; answer: string };

export default function UploadForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [cards, setCards] = useState<Card[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [lastFileUrl, setLastFileUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { startUpload } = useUploadThing("pdfUploader", {
    onUploadError: (err) => {
      const errorMessage = err.message || "Upload failed. Please try again.";
      toast.error("Upload failed", {
        description: errorMessage.length > 100 ? "Please try again" : errorMessage,
      });
      setIsLoading(false);
      setError("Upload failed. Please try again.");
      return;
    },
    onUploadBegin: () => {
      toast.info("Upload started");
      return;
    },
    onClientUploadComplete: () => {
      toast.success("Upload successful!");
      return;
    },
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setCards(null);
    setError(null);

    try {
      const fd = new FormData(e.currentTarget);
      const file = fd.get("file") as File | null;

      if (!file) {
        toast.error("Please select a PDF file");
        setIsLoading(false);
        return;
      }
      if (file.type !== "application/pdf") {
        toast.error("Invalid file type");
        setIsLoading(false);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large", { description: "Maximum file size is 10MB" });
        setIsLoading(false);
        return;
      }

      setFileName(file.name);

      const res = await startUpload([file]);
      if (!res || !res[0]) {
        toast.error("Upload failed");
        setIsLoading(false);
        return;
      }

      
      const fileUrl = (res[0] as any).ufsUrl ?? (res[0] as any).url;
      if (!fileUrl || typeof fileUrl !== "string") {
        toast.error("Could not retrieve file URL");
        setIsLoading(false);
        return;
      }

      setLastFileUrl(fileUrl);

      const gen = await generateFlashcardsFromUrl({
        fileUrl,
        fileName: file.name,
        count: 10,
      });

      if (!gen.success) {
        const errorMessage = gen.message || "Generation failed. Please try again.";
        toast.error("Generation failed", {
          description: errorMessage.length > 100 ? "Please try again" : errorMessage,
        });
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      setCards(gen.data!.cards);
      toast.success("Flashcards generated successfully!");
      formRef.current?.reset();
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred");
      setError("Please try again later");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!cards?.length) return;
    setIsLoading(true);

    try {
      const res = await saveFlashcardsAction({
        fileName: fileName || "document.pdf",
        cards,
      });

      if (res.success) {
        toast.success("Saved to your summaries");
      } else {
        const errorMessage = res.message || "Save failed. Please try again.";
        toast.error("Save failed", {
          description: errorMessage.length > 100 ? "Please try again" : errorMessage,
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Save failed");
    } finally {
      setIsLoading(false);
    }
  }

 
  async function handleRegenerate() {
    if (!lastFileUrl) {
      toast.error("No file to regenerate from");
      return;
    }
    if (!cards?.length) {
      toast.info("Generate flashcards first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const previous = Array.from(new Set(cards.map((c) => c.question)));

      // First attempt
      let gen = await regenerateFlashcardsAction(
        lastFileUrl,
        fileName || "document.pdf",
        10,
        previous
      );

      if (!gen.success) {
        const errorMessage = gen.message || "Regeneration failed. Please try again.";
        toast.error("Regeneration failed", {
          description: errorMessage.length > 100 ? "Please try again" : errorMessage,
        });
        setError(errorMessage);
        return;
      }

      let fresh = gen.data!.cards;

     
      const overlap = overlapCount(previous, fresh.map((c) => c.question));
      if (overlap >= 8) {
        const biggerAvoid = Array.from(
          new Set([...previous, ...fresh.map((c) => c.question)])
        );
        gen = await regenerateFlashcardsAction(
          lastFileUrl,
          fileName || "document.pdf",
          10,
          biggerAvoid
        );
        if (gen.success) {
          fresh = gen.data!.cards;
        }
      }

      setCards(fresh);
      toast.success("New flashcards generated!");
     
    } catch (e) {
      console.error(e);
      toast.error("Unexpected error during regeneration");
      setError("Please try again later");
    } finally {
      setIsLoading(false);
    }
  }

  function handleUploadAnother() {
    setCards(null);
    setFileName("");
    setLastFileUrl("");
    setError(null);
    formRef.current?.reset();
  }

  return (
    <div className="flex flex-col items-center gap-10 w-full">
      <UploadFormInput onSubmit={handleSubmit} isLoading={isLoading} ref={formRef} />

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-lg flex items-center gap-2 max-w-md">
          <AlertCircle size={18} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {cards && (
        <div className="w-full max-w-5xl">
          <h3 className="mb-6 text-2xl font-bold text-center">Your Flashcards</h3>

          {/* Flashcard viewer */}
          <FlashcardGrid cards={cards} fileName={fileName || "Flashcards"} />

          {/* Actions */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Button
              onClick={handleSave}
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl flex items-center gap-2"
              disabled={isLoading}
            >
              <Save size={18} />
              Save to summaries
            </Button>

            <Button
              onClick={handleRegenerate}
              className="px-6 py-3 border border-border hover:bg-accent rounded-xl flex items-center gap-2"
              disabled={isLoading}
              variant="outline"
            >
              <RefreshCw size={18} />
              Regenerate
            </Button>

            <Button
              onClick={handleUploadAnother}
              className="px-6 py-3 border border-border hover:bg-accent rounded-xl flex items-center gap-2"
              disabled={isLoading}
              variant="outline"
            >
              <Upload size={18} />
              Upload another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


function overlapCount(a: string[], b: string[]) {
  const setA = new Set(a.map((s) => s.toLowerCase()));
  let n = 0;
  for (const x of b) if (setA.has(x.toLowerCase())) n++;
  return n;
}