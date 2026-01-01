import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ 
    pdf: { 
      maxFileSize: "16MB",
      maxFileCount: 1,
    } 
  })
    .middleware(async () => {
      const { userId } = await auth();
      
      // Debug logging
      console.log("[UploadThing] Middleware called, userId:", userId);
      
      if (!userId) {
        console.error("[UploadThing] No userId found!");
        throw new Error("Unauthorized");
      }
      
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("[UploadThing] Upload complete!");
      console.log("[UploadThing] File URL:", file.url);
      console.log("[UploadThing] Uploaded by:", metadata.userId);
      
      return { 
        uploadedBy: metadata.userId,
        url: file.url,
        name: file.name,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;