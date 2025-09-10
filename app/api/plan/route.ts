import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

type PlanResponse = {
  plan: "free" | "premium";
  current: number;
  max: number;
  canUpload: boolean;
  canExport: boolean; 
};

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      const anon: PlanResponse = {
        plan: "free",
        current: 0,
        max: 5,
        canUpload: false,
        canExport: false,
      };
      return NextResponse.json(anon);
    }

   
    const rows = await sql`SELECT * FROM user_quotas WHERE userId = ${userId}`;
    let record = Array.isArray(rows) ? rows[0] : rows;

    if (!record) {
      await sql`
        INSERT INTO user_quotas (userId, uploadsThisMonth, plan)
        VALUES (${userId}, 0, 'free')
        ON CONFLICT (userId) DO NOTHING
      `;
      record = { plan: "free", uploadsThisMonth: 0 };
    }

    const plan: "free" | "premium" = (record?.plan === "premium" ? "premium" : "free");
    const current = Number(record?.uploadsthismonth ?? record?.uploadsThisMonth ?? 0);
    const max = plan === "premium" ? 50 : 5;

    const payload: PlanResponse = {
      plan,
      current,
      max,
      canUpload: current < max,
      canExport: plan === "premium",
    };

    return NextResponse.json(payload);
  } catch (e) {
    const fallback: PlanResponse = {
      plan: "free",
      current: 0,
      max: 5,
      canUpload: true,
      canExport: false,
    };
    return NextResponse.json(fallback);
  }
}
