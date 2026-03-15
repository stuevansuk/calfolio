import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { fetchProfile, updateProfileAdmin } from "@/lib/db/api";
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
  if (!profile?.stripeSubscriptionId) {
    return NextResponse.json(
      { success: false, error: "No subscription found" },
      { status: 400 }
    );
  }

  await stripe.subscriptions.update(profile.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });

  await updateProfileAdmin(session.user.id, {
    stripeCancelAtPeriodEnd: false,
  });

  return NextResponse.json({ success: true });
}
