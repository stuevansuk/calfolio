import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  fetchCalendarProject,
  fetchProfile,
  fetchPrintOrders,
  insertPrintOrder,
} from "@/lib/db/api";
import { stripe } from "@/lib/stripe/config";
import { getProductSku } from "@/lib/print/prodigi-products";
import { calculateRetailPrice } from "@/lib/print/pricing";
import { PAGINATION } from "@/lib/constants";
import { z } from "zod/v4";
import type { PaperSize } from "@/lib/print/prodigi-products";

export async function GET(request: NextRequest) {
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

  const { searchParams } = new URL(request.url);
  const limit = Math.min(
    parseInt(searchParams.get("limit") || String(PAGINATION.defaultLimit)),
    PAGINATION.maxLimit
  );
  const offset = parseInt(searchParams.get("offset") || "0");

  const result = await fetchPrintOrders(session.user.id, { limit, offset });
  return NextResponse.json({ success: true, data: result });
}

const createOrderSchema = z.object({
  projectId: z.string().uuid(),
  quantity: z.number().int().min(1).max(100),
  shippingName: z.string().min(1).max(200),
  shippingAddress: z.object({
    line1: z.string().min(1).max(200),
    line2: z.string().max(200).optional(),
    city: z.string().min(1).max(100),
    state: z.string().max(100).optional(),
    postcode: z.string().min(1).max(20),
    country: z.string().length(2),
  }),
  shippingMethod: z.enum(["standard", "express"]),
  wholesalePriceCents: z.number().int().min(0),
  retailPriceCents: z.number().int().min(0),
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
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid input" },
      { status: 400 }
    );
  }

  const project = await fetchCalendarProject(
    parsed.data.projectId,
    session.user.id
  );
  if (!project) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 }
    );
  }

  const profile = await fetchProfile(session.user.id);
  if (!profile) {
    return NextResponse.json(
      { success: false, error: "Profile not found" },
      { status: 404 }
    );
  }

  const sku = getProductSku(project.paperSize as PaperSize);
  if (!sku) {
    return NextResponse.json(
      { success: false, error: "No matching product" },
      { status: 400 }
    );
  }

  // Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: parsed.data.retailPriceCents,
    currency: "gbp",
    metadata: {
      projectId: parsed.data.projectId,
      userId: session.user.id,
    },
  });

  // Create order record
  const order = await insertPrintOrder({
    userId: session.user.id,
    projectId: parsed.data.projectId,
    quantity: parsed.data.quantity,
    shippingName: parsed.data.shippingName,
    shippingAddress: parsed.data.shippingAddress,
    shippingMethod: parsed.data.shippingMethod,
    productSku: sku,
    paperSize: project.paperSize,
    wholesalePriceCents: parsed.data.wholesalePriceCents,
    wholesaleCurrency: "GBP",
    retailPriceCents: parsed.data.retailPriceCents,
    retailCurrency: "GBP",
    stripePaymentIntentId: paymentIntent.id,
    stripePaymentStatus: "pending",
    status: "pending_payment",
  });

  return NextResponse.json(
    {
      success: true,
      data: { orderId: order.id, clientSecret: paymentIntent.client_secret },
    },
    { status: 201 }
  );
}
