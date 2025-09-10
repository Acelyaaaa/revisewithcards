"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function NewsletterClient() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    try {
      setBusy(true);
      // If you later add a backend route, POST there instead:
      // await fetch("/api/newsletter/subscribe", { method: "POST", body: JSON.stringify({ email }) });
      await new Promise((r) => setTimeout(r, 600)); // demo
      toast.success("Subscribed! Thanks for joining ✨");
      setEmail("");
    } catch (e) {
      toast.error("Could not subscribe. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="max-w-xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-2 text-center">Join the newsletter</h1>
      <p className="text-center text-gray-600 mb-8">
        Short, occasional updates about new features and study tips.
      </p>

      <form onSubmit={submit} className="flex gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 rounded-md border px-3 py-2"
          required
        />
        <Button type="submit" disabled={busy} className="whitespace-nowrap">
          {busy ? "Subscribing…" : "Subscribe"}
        </Button>
      </form>
    </section>
  );
}
