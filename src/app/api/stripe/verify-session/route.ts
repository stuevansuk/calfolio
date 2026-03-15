import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { updateProfileAdmin } from "@/lib/db/api";
import { stripe } from "@/lib/stripe/config";
import { z } from "zod/v4";

const verifySchema = z.object({
  sessionId: z.string().min(1),
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
  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid input" },
      { status: 400 }
    );
  }

  const checkoutSession = await stripe.checkout.sessions.retrieve(
    parsed.data.sessionId,
    { expand: ["subscription"] }
  );

  if (checkoutSession.payment_status !== "paid") {
    return NextResponse.json(
      { success: false, error: "Payment not completed" },
      { status: 400 }
    );
  }

  const tier = checkoutSession.metadata?.tier || "hobby";
  const subscription = checkoutSession.subscription as
    | { id: string; items: { data: { price: { id: string }; current_period_end: number }[] } }
    | null;

  if (subscription) {
    const item = subscription.items?.data?.[0];
    await updateProfileAdmin(session.user.id, {
      tier,
      stripeCustomerId:
        typeof checkoutSession.customer === "string"
          ? checkoutSession.customer
          : checkoutSession.customer?.id,
      stripeSubscriptionId: subscription.id,
      stripePriceId: item?.price?.id,
      stripeCurrentPeriodEnd: item
        ? new Date(item.current_period_end * 1000)
        : null,
    });
  }

  return NextResponse.json({ success: true, data: { tier } });
}
