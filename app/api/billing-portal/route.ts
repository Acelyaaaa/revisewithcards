// app/api/billing-portal/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const { userId } = await auth();
  if (!userId) return NextResponse.redirect(new URL("/sign-in", url.origin));

  const SECRET = process.env.STRIPE_SECRET_KEY!;
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || url.origin;
  const stripe = new Stripe(SECRET);

 
  let customerId: string | undefined;
  try {
    const subs = await stripe.subscriptions.search({
      query: `metadata['userId']:'${userId}' AND status:'active'`,
      limit: 1,
    });
    customerId = subs.data[0]?.customer as string | undefined;
  } catch {}
  if (!customerId) {
    const customers = await stripe.customers.search({
      query: `metadata['userId']:'${userId}'`, limit: 1,
    });
    customerId = customers.data[0]?.id;
  }
  if (!customerId) {
    const c = await stripe.customers.create({ metadata: { userId } });
    customerId = c.id;
  }

 
  const active = await stripe.billingPortal.configurations.list({ active: true, limit: 1 });
  const configuration = active.data[0]?.id;

  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId!,
    configuration,
    return_url: `${APP_URL}/upload?portal=done`,
  });

  return NextResponse.redirect(portal.url, { status: 303 });
}
