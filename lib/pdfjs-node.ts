// lib/pdfjs-node.ts
import "server-only";

/**
 * Loads pdfjs-dist in a Node-safe way.
 * - Ensures DOMMatrix exists (canvas if available, otherwise a minimal shim)
 * - Disables workers/fonts for server usage
 * - Returns the pdfjs-dist library (getDocument, GlobalWorkerOptions, etc.)
 */
export async function loadPdfJs() {
  // 1) Ensure DOMMatrix exists (needed by pdfjs-dist for transforms)
  if (typeof (globalThis as any).DOMMatrix === "undefined") {
    try {
      const { DOMMatrix } = await import("canvas"); // optional dependency
      (globalThis as any).DOMMatrix = DOMMatrix as any;
    } catch {
      // Minimal DOMMatrix shim sufficient for text extraction
      class DOMMatrixShim {
        // minimal properties/methods pdfjs touches
        a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
        constructor(_init?: any) {}
        multiplySelf(_m?: any) { return this; }
        translateSelf(_x = 0, _y = 0) { return this; }
        scaleSelf(_sx = 1, _sy = 1) { return this; }
        rotateSelf(_deg = 0) { return this; }
        toFloat32Array() { return new Float32Array([this.a, this.b, this.c, this.d, this.e, this.f]); }
      }
      (globalThis as any).DOMMatrix = DOMMatrixShim as any;
    }
  }

  // 2) Load pdfjs-dist. Prefer legacy build for Node; fall back to main if unavailable.
  let pdfjsLib: any;
  try {
    pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.js");
  } catch {
    pdfjsLib = await import("pdfjs-dist");
  }

  // 3) Node/server settings
  if (pdfjsLib?.GlobalWorkerOptions) {
    // No worker file in Node
    pdfjsLib.GlobalWorkerOptions.workerSrc = undefined as any;
  }

  return pdfjsLib;
}
