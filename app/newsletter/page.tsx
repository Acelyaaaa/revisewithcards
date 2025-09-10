import type { Metadata } from "next";
import NewsletterClient from "@/components/newsletter/newsletter-client";

export const metadata: Metadata = {
  title: "Newsletter • Revisecards",
  description: "Get occasional updates about new features and study tips.",
};

export default function NewsletterPage() {
  return <NewsletterClient />;
}
