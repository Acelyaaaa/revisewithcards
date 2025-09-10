"use client";
import { useEffect, useState } from "react";

export default function PlanBadge() {
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/plan")
      .then((r) => r.json())
      .then((d) => setPlan(d.plan))
      .catch(() => setPlan("free"));
  }, []);

  if (plan !== "premium") return null;

  return (
    <span className="px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700 border border-rose-200">
      Pro
    </span>
  );
}
