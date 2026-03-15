import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { fetchCalendarProject } from "@/lib/db/api";
import { getQuote } from "@/lib/print/prodigi";
import { getProductSku } from "@/lib/print/prodigi-products";
import { calculateRetailPrice } from "@/lib/print/pricing";
import { z } from "zod/v4";
import type { PaperSize } from "@/lib/print/prodigi-products";

const quoteSchema = z.object({
  projectId: z.string().uuid(),
  quantity: z.number().int().min(1).max(100),
  shippingMethod: z.enum(["standard", "express"]),
  destinationCountryCode: z.string().length(2),
});

export async function POST(request: NextRequest) {
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

  const body = await request.json();
  const parsed = quoteSchema.safeParse(body);
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

  const sku = getProductSku(project.paperSize as PaperSize);
  if (!sku) {
    return NextResponse.json(
      { success: false, error: "No matching product for this paper size" },
      { status: 400 }
    );
  }

  try {
    const quote = await getQuote({
      sku,
      copies: parsed.data.quantity,
      attributes: {},
      assets: [{ printArea: "default", url: "https://placeholder.com/pdf" }],
      shippingMethod: parsed.data.shippingMethod,
      destinationCountryCode: parsed.data.destinationCountryCode,
    });

    const wholesalePriceCents = Math.round(
      (quote.quotes?.[0]?.costSummary?.totalCost?.amount ?? 0) * 100
    );
    const retailPriceCents = calculateRetailPrice(
      wholesalePriceCents,
      parsed.data.quantity
    );

    return NextResponse.json({
      success: true,
      data: {
        wholesalePriceCents,
        retailPriceCents,
        currency: "GBP",
        sku,
        shippingMethod: parsed.data.shippingMethod,
      },
    });
  } catch (error) {
    console.error("Prodigi quote error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get quote" },
      { status: 500 }
    );
  }
}
