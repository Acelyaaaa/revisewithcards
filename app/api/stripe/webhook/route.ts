import { NextResponse } from "next/server";
import Stripe from "stripe";
import { sql } from "@/lib/db";

export const runtime = "nodejs"; 


export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!sig || !webhookSecret || !secretKey) {
    return new NextResponse("Missing Stripe config", { status: 400 });
  }

  const stripe = new Stripe(secretKey);
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
  } catch (err: any) {
    console.error("Stripe signature error:", err.message);
    return new NextResponse("Bad signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const userId =
          s.metadata?.userId ??
          (typeof s.subscription === "string"
            ? undefined
            : (s.subscription?.metadata as any)?.userId);

        if (userId) {
          await sql`
            INSERT INTO user_quotas (userId, uploadsThisMonth, plan, updatedAt)
            VALUES (${userId}, 0, 'premium', NOW())
            ON CONFLICT (userId) DO UPDATE SET plan='premium', updatedAt=NOW()
          `;
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId as string | undefined;
        if (!userId) break;

        
        const activeStatuses = new Set<Stripe.Subscription.Status>([
          "active",
          "trialing",
          "past_due",
        ]);
        const nextPlan = activeStatuses.has(sub.status) ? "premium" : "free";

        await sql`UPDATE user_quotas SET plan=${nextPlan}, updatedAt=NOW() WHERE userId=${userId}`;
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId as string | undefined;
        if (userId) {
          await sql`UPDATE user_quotas SET plan='free', updatedAt=NOW() WHERE userId=${userId}`;
        }
        break;
      }

      default:
       
        break;
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("Webhook handler failed:", e);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}
