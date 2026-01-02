"use client";

import { FileText } from "lucide-react";
import NavLink from "./nav-link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import PlanBadge from "./plan-badge";
import Image from "next/image";

export default function Header() {
  return (
    <nav className="container flex items-center justify-between py-4 px-2 lg:px-8 mx-auto">
      {/* Brand with Logo */}
      <div className="flex flex-1">
        <NavLink href="/upload" className="flex items-center gap-2 shrink-0 group">
          
          <div className="relative w-10 h-10 lg:w-12 lg:h-12">
            <Image
              src="/logo.png"
              alt="Revisecards Logo"
              fill
              className="object-contain"
            />
          </div>
          
          <span className="font-extrabold text-lg lg:text-2xl bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent tracking-tight">
            Revisecards
          </span>
        </NavLink>
      </div>

     
      <div className="flex gap-4 lg:gap-8 items-center">
        <SignedIn>
          <NavLink href="/upload">Upload</NavLink>
        </SignedIn>
        <SignedIn>
          <NavLink href="/summaries">Summaries</NavLink>
        </SignedIn>
        <NavLink href="/pricing">Pricing</NavLink>
      </div>

      
      <div className="flex lg:flex-1 lg:justify-end">
        <SignedIn>
          <div className="flex gap-2 items-center">
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