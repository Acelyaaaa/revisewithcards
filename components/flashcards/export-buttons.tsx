"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { saveBase64File } from "@/utils/download";
import { exportFlashcardsToMarkdown, exportFlashcardsToPdf } from "@/actions/export-actions";
import { toast } from "sonner";
import { FileDown, FileText } from "lucide-react";

export type Flashcard = { question: string; answer: string };

type PlanPayload = {
  plan: "free" | "premium";
  canExport: boolean;
};

export default function ExportButtons({
  fileName,
  cards,
}: {
  fileName: string;
  cards: Flashcard[];
}) {
  const [plan, setPlan] = useState<PlanPayload>({ plan: "free", canExport: false });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/plan")
      .then((r) => r.json())
      .then((p: PlanPayload) => setPlan(p))
      .catch(() => setPlan({ plan: "free", canExport: false }));
  }, []);

  async function doExport(kind: "md" | "pdf") {
    if (!plan.canExport) {
      toast.error("Export is a Pro feature");
      return;
    }
    startTransition(async () => {
      try {
        if (kind === "md") {
          const res = await exportFlashcardsToMarkdown({ fileName, cards });
          saveBase64File(res);
        } else {
          const res = await exportFlashcardsToPdf({ fileName, cards });
          saveBase64File(res);
        }
        toast.success("Export ready!");
      } catch (e) {
        console.error(e);
        toast.error("Export failed");
      }
    });
  }

  return (
    <div className="flex gap-3 flex-wrap justify-center">
      <Button
        onClick={() => doExport("md")}
        disabled={!plan.canExport || isPending}
        className="gap-2"
        variant={plan.canExport ? "default" : "outline"}
        title={plan.canExport ? "Download Markdown" : "Upgrade to export"}
      >
        <FileText size={16} />
        Export Markdown
      </Button>
      <Button
        onClick={() => doExport("pdf")}
        disabled={!plan.canExport || isPending}
        className="gap-2"
        variant={plan.canExport ? "default" : "outline"}
        title={plan.canExport ? "Download PDF" : "Upgrade to export"}
      >
        <FileDown size={16} />
        Export PDF
      </Button>
    </div>
  );
}
