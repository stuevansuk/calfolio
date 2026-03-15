import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { fetchPrintOrder, updatePrintOrder } from "@/lib/db/api";
import { cancelOrder } from "@/lib/print/prodigi";
import { stripe } from "@/lib/stripe/config";

const CANCELLABLE_STATUSES = ["pending_payment", "paid", "generating_pdf", "submitted"];

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const rl = checkRateLimit(session.user.id, "api");
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
      { status: 429 }
    );
  }

  const { id } = await params;
  const order = await fetchPrintOrder(id, session.user.id);
  if (!order) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 }
    );
  }

  if (!CANCELLABLE_STATUSES.includes(order.status)) {
    return NextResponse.json(
      { success: false, error: "Order cannot be cancelled at this stage" },
      { status: 400 }
    );
  }

  // Cancel with Prodigi if already submitted
  if (order.providerOrderId) {
    try {
      await cancelOrder(order.providerOrderId);
    } catch (err) {
      console.error("Failed to cancel Prodigi order:", err);
    }
  }

  // Refund Stripe payment if paid
  if (order.stripePaymentIntentId && order.stripePaymentStatus === "succeeded") {
    try {
      await stripe.refunds.create({
        payment_intent: order.stripePaymentIntentId,
      });
    } catch (err) {
      console.error("Failed to refund:", err);
    }
  }

  const updated = await updatePrintOrder(id, session.user.id, {
    status: "cancelled",
  });

  return NextResponse.json({ success: true, data: updated });
}
