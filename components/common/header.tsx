// components/common/header.tsx
import { FileText } from "lucide-react";
import NavLink from "./nav-link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import PlanBadge from "./plan-badge";

export default function Header() {
  return (
    <nav className="container flex items-center justify-between py-4 px-2 lg:px-8 mx-auto">
      {/* Logo (brand color only here) */}
      <div className="flex flex-1">
        <NavLink href="/" className="flex items-center gap-2 shrink-0 group">
          <FileText
            className="w-6 h-6 lg:w-7 lg:h-7 transition-transform group-hover:-rotate-6"
            style={{ color: "var(--brand-pink)" }}
            aria-hidden
          />
          <span
            className="font-extrabold lg:text-xl tracking-tight"
            style={{ color: "var(--brand-pink)" }}
          >
            Revisecards
          </span>
        </NavLink>
      </div>

      {/* Middle links */}
      <div className="flex gap-4 lg:gap-12 lg:justify-center lg:items-center">
        <NavLink href={"/#pricing"}>Pricing</NavLink>
        <SignedIn>
          <NavLink href={"/summaries"}>Your summaries</NavLink>
        </SignedIn>
      </div>

      {/* Right side */}
      <div className="flex lg:flex-1 lg:justify-end">
        <SignedIn>
          <div className="flex gap-2 items-center">
            <NavLink href={"/upload"}>Upload a PDF</NavLink>
            <PlanBadge />
            <UserButton />
          </div>
        </SignedIn>
        <SignedOut>
          <NavLink href={"/sign-in"}>Sign In</NavLink>
        </SignedOut>
      </div>
    </nav>
  );
}
