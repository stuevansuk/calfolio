import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { fetchProfile, updateProfileAdmin } from "@/lib/db/api";
import { stripe, PRICE_IDS } from "@/lib/stripe/config";
import { z } from "zod/v4";

const checkoutSchema = z.object({
  tier: z.enum(["hobby", "pro"]),
  interval: z.enum(["monthly", "annual"]),
});

export async function POST(request: NextRequest) {
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

  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid input" },
      { status: 400 }
    );
  }

  const profile = await fetchProfile(session.user.id);
  if (!profile) {
    return NextResponse.json(
      { success: false, error: "Profile not found" },
      { status: 404 }
    );
  }

  const priceId = PRICE_IDS[parsed.data.tier][parsed.data.interval];

  // If already subscribed, upgrade in-place
  if (profile.stripeSubscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(
      profile.stripeSubscriptionId
    );
    await stripe.subscriptions.update(profile.stripeSubscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: priceId,
        },
      ],
      proration_behavior: "create_prorations",
    });

    await updateProfileAdmin(session.user.id, {
      tier: parsed.data.tier,
      stripePriceId: priceId,
    });

    return NextResponse.json({
      success: true,
      data: { upgraded: true },
    });
  }

  // Create or get customer
  let customerId = profile.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email,
      metadata: { userId: session.user.id },
    });
    customerId = customer.id;
    await updateProfileAdmin(session.user.id, {
      stripeCustomerId: customerId,
    });
  }

  // Create checkout session
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/app/settings?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/pricing`,
    metadata: { userId: session.user.id, tier: parsed.data.tier },
  });

  return NextResponse.json({
    success: true,
    data: { url: checkoutSession.url },
  });
}
