// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in?intent=subscribe", url.origin));
  }

  const SECRET = process.env.STRIPE_SECRET_KEY!;
  const PRICE  = process.env.STRIPE_PRICE_PRO!;
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || url.origin;

  const stripe = new Stripe(SECRET);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: PRICE, quantity: 1 }],
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    success_url: `${APP_URL}/upload?checkout=success`, 
    cancel_url: `${APP_URL}/#pricing`,
    metadata: { userId },
    subscription_data: { metadata: { userId } }, 
  });

  return NextResponse.redirect(session.url!, { status: 303 });
}
