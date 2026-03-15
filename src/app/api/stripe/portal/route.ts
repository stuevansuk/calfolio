import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { fetchProfile } from "@/lib/db/api";
import { stripe } from "@/lib/stripe/config";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const rl = checkRateLimit(session.user.id, "stripe");
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
      { status: 429 }
    );
  }

  const profile = await fetchProfile(session.user.id);
  if (!profile?.stripeCustomerId) {
    return NextResponse.json(
      { success: false, error: "No billing account found" },
      { status: 400 }
    );
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: profile.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/settings`,
  });

  return NextResponse.json({
    success: true,
    data: { url: portalSession.url },
  });
}
