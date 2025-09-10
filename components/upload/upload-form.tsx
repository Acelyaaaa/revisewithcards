"use client";

import UploadFormInput from "@/components/upload/upload-form-input";
import { useUploadThing } from "@/utils/uploadthings";
import { toast } from "sonner";
import { useRef, useState } from "react";

export default function UploadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { startUpload } = useUploadThing("pdfUploader", {
    onClientUploadComplete: () => {
      toast.success("✅ Upload successful!");
    },
    onUploadError: (err) => {
      toast.error("❌ Upload failed", {
        description: err.message,
      });
    },
    onUploadBegin: (fileName) => {
      toast("📤 Upload started", { description: fileName });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;

    if (!file) {
      toast.error("Please select a file");
      setIsLoading(false);
      return;
    }

    try {
      toast("Uploading PDF...");
      const uploadResponse = await startUpload([file]);

      if (!uploadResponse) {
        toast.error("Something went wrong");
        return;
      }

      const uploadFileUrl = uploadResponse[0].serverData.file;
      toast.success("Uploaded!", { description: uploadFileUrl });

      // 👇 from here, you can call your AI actions (generatePdfText, generatePdfSummary, etc.)
      // and push to the summaries page.
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error while uploading");
    } finally {
      setIsLoading(false);
      formRef.current?.reset();
    }
  };

  return (
    <div className="flex justify-center">
      <UploadFormInput onSubmit={handleSubmit} isLoading={isLoading} ref={formRef} />
    </div>
  );
}
