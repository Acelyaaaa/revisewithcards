"use client";

export function saveBase64File(params: { filename: string; base64: string; mime: string }) {
  const { filename, base64, mime } = params;
  const buf = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  const blob = new Blob([buf], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
