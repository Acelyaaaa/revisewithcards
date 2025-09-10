import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force bundling of pdfjs-dist so our polyfill runs before it executes
  transpilePackages: ["pdfjs-dist"],

  // DO NOT externalize pdfjs-dist (leave it out of this list).
  // If you already have this key, just ensure 'pdfjs-dist' is NOT listed.
  serverExternalPackages: [
    // e.g. you can keep 'pdf-parse' external if you like
    "pdf-parse",
  ],
};

export default nextConfig;
