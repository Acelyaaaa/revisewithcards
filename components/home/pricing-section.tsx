'use client';

import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SignedIn, SignedOut } from "@clerk/nextjs";

type Plan = { id: "basic" | "pro"; name: string; price: number; description: string; items: string[] };

const plans: Plan[] = [
  { id: "basic", name: "Basic", price: 0, description: "Get started for free", items: ["5 PDF uploads / month", "Standard processing", "Email support"] },
  { id: "pro", name: "Pro", price: 19, description: "Everything you need to study faster", items: ["50 PDF uploads / month", "Priority processing", "Export to Markdown & PDF", "24/7 priority support"] },
];

function PlanCTA() {
  const [plan, setPlan] = useState<"free" | "premium" | "unknown">("unknown");
  useEffect(() => {
    fetch("/api/plan")
      .then((r) => (r.ok ? r.json() : { plan: "free" }))
      .then((d) => setPlan((d?.plan ?? "free") as "free" | "premium"))
      .catch(() => setPlan("free"));
  }, []);

  return (
    <>
      <SignedIn>
        {plan === "premium" ? (
          <Link href="/api/billing-portal" className="w-full rounded-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-800 to-rose-500 hover:bg-gradient-to-l text-white border-2 py-2 border-rose-900">
            Manage subscription
          </Link>
        ) : (
          <Link href="/api/checkout" className="w-full rounded-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-800 to-rose-500 hover:bg-gradient-to-l text-white border-2 py-2 border-rose-900">
            Buy Now
          </Link>
        )}
      </SignedIn>
      <SignedOut>
        <Link href="/sign-in?intent=subscribe" className="w-full rounded-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-400 to-rose-500 hover:bg-gradient-to-l text-white border-2 py-2 border-rose-100">
          Sign in to upgrade
        </Link>
      </SignedOut>
    </>
  );
}

const PricingCard = ({ id, name, price, description, items }: Plan) => {
  const highlighted = id === "pro";
  return (
    <div className="reveal reveal-up relative w-full max-w-lg hover:scale-[1.02] transition-transform duration-300">
      <div className={cn("relative flex flex-col h-full gap-4 lg:gap-8 z-10 p-8 border border-gray-500/20 rounded-2xl bg-white/80 backdrop-blur",
        highlighted && "border-rose-500 border-2")}>
        <div className="flex justify-between items-center gap-4">
          <div>
            <p className="text-lg lg:text-xl font-bold capitalize">{name}</p>
            <p className="text-gray-600 mt-2">{description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <p className="text-5xl tracking-tight font-extrabold">£{price}</p>
          <div className="flex flex-col justify-end mb-[4px]">
            <p className="text-xs uppercase font-semibold">GBP</p>
            <p className="text-xs">/month</p>
          </div>
        </div>
        <ul className="space-y-2.5 leading-relaxed text-base">
          {items.map((item, idx) => (
            <li className="flex items-center gap-2" key={idx}>
              <CheckIcon size={18} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-2 flex justify-center w-full">
          {id === "pro" ? (
            <PlanCTA />
          ) : (
            <Link href="/sign-in" className="w-full rounded-full flex items-center justify-center gap-2 bg-gradient-to-r from-slate-900 to-rose-500 hover:bg-gradient-to-l text-white border-2 py-2 border-rose-900">
              Get started free
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default function PricingSection() {
  return (
    <section id="pricing" className="reveal reveal-up">
      <div className="py-12 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 lg:pt-12">
        <div className="reveal reveal-up flex items-center justify-center w-full pb-12">
          <h2 className="uppercase font-bold text-xl mb-8 text-rose-500">Pricing</h2>
        </div>
        <div className="reveal-stagger relative flex justify-center flex-col lg:flex-row items-center lg:items-stretch gap-8">
          {plans.map((p) => (
            <PricingCard key={p.id} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
}
