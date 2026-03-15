import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/config";
import {
  checkWebhookProcessed,
  insertWebhookEvent,
  updateProfileAdmin,
  fetchPrintOrderByPaymentIntent,
  updatePrintOrderAdmin,
} from "@/lib/db/api";
import { profiles } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { success: false, error: "Missing signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { success: false, error: "Invalid signature" },
      { status: 400 }
    );
  }

  // Idempotency check
  const already = await checkWebhookProcessed(event.id);
  if (already) {
    return NextResponse.json({ success: true, data: { duplicate: true } });
  }

  try {
    switch (event.type) {
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        const [profile] = await db
          .select()
          .from(profiles)
          .where(eq(profiles.stripeCustomerId, customerId))
          .limit(1);

        if (profile) {
          await updateProfileAdmin(profile.userId, {
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price?.id,
            stripeCurrentPeriodEnd: new Date(
              subscription.items.data[0].current_period_end * 1000
            ),
            stripeCancelAtPeriodEnd: subscription.cancel_at_period_end,
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        const [profile] = await db
          .select()
          .from(profiles)
          .where(eq(profiles.stripeCustomerId, customerId))
          .limit(1);

        if (profile) {
          await updateProfileAdmin(profile.userId, {
            tier: "free",
            stripeSubscriptionId: null,
            stripePriceId: null,
            stripeCurrentPeriodEnd: null,
            stripeCancelAtPeriodEnd: false,
          });
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const order = await fetchPrintOrderByPaymentIntent(paymentIntent.id);
        if (order) {
          await updatePrintOrderAdmin(order.id, {
            stripePaymentStatus: "succeeded",
            status: "paid",
          });
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const order = await fetchPrintOrderByPaymentIntent(paymentIntent.id);
        if (order) {
          await updatePrintOrderAdmin(order.id, {
            stripePaymentStatus: "failed",
            status: "failed",
            errorMessage: "Payment failed",
          });
        }
        break;
      }
    }

    await insertWebhookEvent(event.id, "stripe", event.type);
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json(
      { success: false, error: "Processing error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
