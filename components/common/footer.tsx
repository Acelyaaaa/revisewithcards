"use client";

import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { FileText, Mail } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">

        {/* Brand + CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-rose-600" />
            <div>
              <p className="font-semibold">Revisecards</p>
              <p className="text-sm text-gray-600">Turn PDFs into concise flashcards.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SignedOut>
              <Link
                href="/sign-in"
                className="inline-flex items-center rounded-xl bg-gradient-to-r from-slate-900 to-rose-500 px-4 py-2 text-white hover:opacity-90"
              >
                Try Revisecards
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/upload"
                className="inline-flex items-center rounded-xl bg-gradient-to-r from-slate-900 to-rose-500 px-4 py-2 text-white hover:opacity-90"
              >
                Upload a PDF
              </Link>
            </SignedIn>
          </div>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 py-8">
          <div>
            <h4 className="font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li><Link href="/upload" className="hover:text-rose-600">Upload a PDF</Link></li>
              <li><Link href="/summaries" className="hover:text-rose-600">Your summaries</Link></li>
              <li><Link href="/#pricing" className="hover:text-rose-600">Pricing</Link></li>
              <li><Link href="/#demo" className="hover:text-rose-600">Demo</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Learn</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li><Link href="/faq" className="hover:text-rose-600">FAQ</Link></li>
              <li><Link href="/study-responsibly" className="hover:text-rose-600">Study responsibly</Link></li>
              <li><Link href="/academic-honesty" className="hover:text-rose-600">Academic honesty</Link></li>
              <li><Link href="/newsletter" className="hover:text-rose-600">Newsletter</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li><Link href="/privacy" className="hover:text-rose-600">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-rose-600">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <a href="mailto:revisecards@gmail.com" className="hover:text-rose-600">
                  revisecards@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        
        <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600">
          <p>© {year} Revisecards. All rights reserved.</p>
          <p className="text-center sm:text-right">
            We generate flashcards with AI. Your uploads are not used to train external models.
          </p>
        </div>
      </div>
    </footer>
  );
}
