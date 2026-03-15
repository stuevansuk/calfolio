import { NextRequest, NextResponse } from "next/server";
import {
  checkWebhookProcessed,
  insertWebhookEvent,
  updatePrintOrderAdmin,
} from "@/lib/db/api";
import { db } from "@/lib/db";
import { printOrders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createHmac } from "crypto";

function verifyProdigiSignature(
  body: string,
  signature: string | null
): boolean {
  if (!signature || !process.env.PRODIGI_WEBHOOK_SECRET) return false;
  const expected = createHmac("sha256", process.env.PRODIGI_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");
  return signature === expected;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-prodigi-signature");

  if (!verifyProdigiSignature(body, signature)) {
    return NextResponse.json(
      { success: false, error: "Invalid signature" },
      { status: 400 }
    );
  }

  const event = JSON.parse(body);
  const eventId = event.id || `prodigi-${Date.now()}`;

  // Idempotency check
  const already = await checkWebhookProcessed(eventId);
  if (already) {
    return NextResponse.json({ success: true, data: { duplicate: true } });
  }

  try {
    const orderId = event.data?.order?.id;
    if (!orderId) {
      return NextResponse.json({ success: true });
    }

    // Find our order by provider order ID
    const [order] = await db
      .select()
      .from(printOrders)
      .where(eq(printOrders.providerOrderId, orderId))
      .limit(1);

    if (!order) {
      console.warn("Prodigi webhook: order not found:", orderId);
      return NextResponse.json({ success: true });
    }

    const statusMap: Record<string, string> = {
      "order.created": "submitted",
      "order.in_progress": "in_production",
      "order.shipped": "shipped",
      "order.complete": "delivered",
      "order.cancelled": "cancelled",
      "order.failed": "failed",
    };

    const newStatus = statusMap[event.type];
    const updates: Record<string, unknown> = {};

    if (newStatus) {
      updates.status = newStatus;
      updates.providerStatus = event.type;
    }

    // Extract tracking info if shipped
    if (event.type === "order.shipped") {
      const shipment = event.data?.order?.shipments?.[0];
      if (shipment) {
        updates.trackingNumber = shipment.trackingNumber;
        updates.trackingUrl = shipment.trackingUrl;
      }
    }

    if (event.type === "order.failed") {
      updates.errorMessage =
        event.data?.order?.statusDetail?.description || "Order failed";
    }

    if (Object.keys(updates).length > 0) {
      await updatePrintOrderAdmin(order.id, updates);
    }

    await insertWebhookEvent(eventId, "prodigi", event.type);
  } catch (err) {
    console.error("Prodigi webhook processing error:", err);
    return NextResponse.json(
      { success: false, error: "Processing error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
