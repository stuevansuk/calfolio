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
    return NextResponse.json({ success: true, data: { synced: false } });
  }

  const subscription = await stripe.subscriptions.retrieve(
    profile.stripeSubscriptionId
  );

  const tierMap: Record<string, string> = {};
  const priceId = subscription.items.data[0]?.price?.id;
  // Map price IDs to tiers
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_HOBBY_MONTHLY ||
      priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_HOBBY_ANNUAL) {
    tierMap[priceId] = "hobby";
  } else if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY ||
             priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL) {
    tierMap[priceId] = "pro";
  }

  const tier = priceId ? tierMap[priceId] || profile.tier : profile.tier;

  await updateProfileAdmin(session.user.id, {
    tier,
    stripePriceId: priceId,
    stripeCurrentPeriodEnd: new Date(
      subscription.items.data[0].current_period_end * 1000
    ),
    stripeCancelAtPeriodEnd: subscription.cancel_at_period_end,
  });

  return NextResponse.json({ success: true, data: { synced: true, tier } });
}
