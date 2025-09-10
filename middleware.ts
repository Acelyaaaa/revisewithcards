// middleware.ts
import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Only these routes require sign-in
const isProtectedRoute = createRouteMatcher([
  "/upload(.*)",
  "/summaries(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();

  // If the user hits a protected route and isn't signed in, send them to Clerk
  if (isProtectedRoute(req) && !userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Otherwise continue as normal (you can add headers here if you want)
  return NextResponse.next();
});

// Run the middleware for everything except Next internals, static files and the Stripe webhook.
export const config = {
  matcher: [
    "/((?!_next|.*\\..*|favicon.ico|api/stripe/webhook).*)",
  ],
};
