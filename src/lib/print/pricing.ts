import { PRINT_PRICING } from "@/lib/constants";

export function calculateRetailPrice(
  wholesalePriceCents: number,
  quantity: number
): number {
  const markupAmount = Math.round(
    wholesalePriceCents * (PRINT_PRICING.markupPercent / 100)
  );
  return (
    (wholesalePriceCents + markupAmount + PRINT_PRICING.handlingFeeCents) *
    quantity
  );
}

export function calculateMargin(
  retailPriceCents: number,
  wholesalePriceCents: number
): number {
  if (retailPriceCents === 0) return 0;
  return ((retailPriceCents - wholesalePriceCents) / retailPriceCents) * 100;
}
