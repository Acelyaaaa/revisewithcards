"use client";

import { Button } from "@/components/ui/button";
import { useState, forwardRef } from "react";
import { Upload, Loader2 } from "lucide-react";

interface UploadFormInputProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

const UploadFormInput = forwardRef<HTMLFormElement, UploadFormInputProps>(
  ({ onSubmit, isLoading }, ref) => {
    const [fileName, setFileName] = useState("");

    return (
      <form
        ref={ref}
        className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 border border-gray-200 flex flex-col items-center gap-6"
        onSubmit={onSubmit}
      >
        {/* Upload Box */}
        <label
          htmlFor="file"
          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
        >
          <Upload className="h-10 w-10 text-rose-500 mb-2" />
          <span className="text-gray-600 text-sm font-medium">
            {fileName ? fileName : "Click or drag & drop your PDF here"}
          </span>
          <input
            id="file"
            type="file"
            name="file"
            accept="application/pdf"
            required
            disabled={isLoading}
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setFileName(e.target.files[0].name);
              }
            }}
          />
        </label>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-rose-600 hover:bg-rose-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            "Upload PDF"
          )}
        </Button>
      </form>
    );
  }
);

UploadFormInput.displayName = "UploadFormInput";

export default UploadFormInput;
