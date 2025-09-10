"use client";

import { FileText } from "lucide-react";
import NavLink from "./nav-link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import PlanBadge from "./plan-badge";

export default function Header() {
  return (
    <nav className="container flex items-center justify-between py-4 px-2 lg:px-8 mx-auto">
      {/* Brand */}
      <div className="flex flex-1">
        <NavLink href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="grid place-items-center rounded-xl p-2 bg-gradient-to-br from-rose-500 to-fuchsia-600 text-white shadow-sm group-hover:scale-105 transition">
            <FileText className="w-5 h-5 lg:w-6 lg:h-6" />
          </div>
          <span className="font-extrabold lg:text-xl bg-gradient-to-r from-rose-600 to-fuchsia-600 bg-clip-text text-transparent">
            Revisecards
          </span>
        </NavLink>
      </div>

      {/* Center nav */}
      <div className="flex gap-4 lg:gap-12 items-center">
        {/* 👉 go to a real page, not #pricing */}
        <NavLink href="/pricing">Pricing</NavLink>
        <SignedIn>
          <NavLink href="/summaries">Your summaries</NavLink>
        </SignedIn>
      </div>

      {/* Right actions */}
      <div className="flex lg:flex-1 lg:justify-end">
        <SignedIn>
          <div className="flex gap-2 items-center">
            <NavLink href="/upload">Upload a PDF</NavLink>
            <PlanBadge />
            <UserButton />
          </div>
        </SignedIn>
        <SignedOut>
          <NavLink href="/sign-in">Sign In</NavLink>
        </SignedOut>
      </div>
    </nav>
  );
}
