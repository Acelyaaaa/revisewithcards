import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  
  // Verify authentication
  const { userId } = await auth();
  if (!userId) {
    console.log("❌ Unauthorized billing portal access attempt");
    return NextResponse.redirect(
      new URL("/sign-in?redirect=/upload", url.origin)
    );
  }

  const SECRET = process.env.STRIPE_SECRET_KEY;
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || url.origin;

  if (!SECRET) {
    console.error("❌ Missing Stripe secret key");
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(SECRET);

  try {
    console.log(`🔍 Finding Stripe customer for user: ${userId}`);
    
    
    let customerId: string | null = null;
    
    try {
      const result = await sql`
        SELECT stripeCustomerId FROM user_quotas WHERE userId = ${userId}
      `;
      const row = Array.isArray(result) ? result[0] : result;
      customerId = row?.stripecustomerid || row?.stripeCustomerId || null;
    } catch (dbError) {
      console.error("❌ Database query failed:", dbError);
    }

    
    if (!customerId) {
      console.log("🔍 Searching Stripe for active subscriptions...");
      try {
        const subscriptions = await stripe.subscriptions.search({
          query: `metadata['userId']:'${userId}' AND status:'active'`,
          limit: 1,
        });
        
        if (subscriptions.data.length > 0) {
          customerId = subscriptions.data[0].customer as string;
          console.log(`✅ Found customer via subscription: ${customerId}`);
        }
      } catch (subError) {
        console.error("❌ Subscription search failed:", subError);
      }
    }

   
    if (!customerId) {
      console.log("🔍 Searching Stripe customers...");
      try {
        const customers = await stripe.customers.search({
          query: `metadata['userId']:'${userId}'`,
          limit: 1,
        });
        
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
          console.log(`✅ Found existing customer: ${customerId}`);
        }
      } catch (custError) {
        console.error("❌ Customer search failed:", custError);
      }
    }

   
    if (!customerId) {
      console.log("➕ Creating new Stripe customer...");
      const customer = await stripe.customers.create({
        metadata: { userId },
      });
      customerId = customer.id;
      console.log(`✅ Created new customer: ${customerId}`);
      
      try {
        await sql`
          INSERT INTO user_quotas (userId, stripeCustomerId, plan)
          VALUES (${userId}, ${customerId}, 'free')
          ON CONFLICT (userId) DO UPDATE SET
            stripeCustomerId = EXCLUDED.stripeCustomerId,
            updatedAt = NOW()
        `;
      } catch (dbError) {
        console.error("❌ Failed to update database with customer ID:", dbError);
      }
    }

    
    console.log("🔍 Getting billing portal configuration...");
    const configs = await stripe.billingPortal.configurations.list({
      active: true,
      limit: 1,
    });
    
    const configuration = configs.data[0]?.id;

    
    console.log("✅ Creating billing portal session...");
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${APP_URL}/upload?portal=done`,
      ...(configuration && { configuration }),
    });

    console.log(`✅ Billing portal session created: ${portalSession.id}`);
    
    return NextResponse.redirect(portalSession.url, { status: 303 });
    
  } catch (error: any) {
    console.error("❌ Billing portal error:", error);
    
    return NextResponse.redirect(
      new URL(`/upload?error=${encodeURIComponent(error.message)}`, url.origin),
      { status: 303 }
    );
  }
}