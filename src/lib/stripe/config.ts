import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-02-25.clover",
    });
  }
  return _stripe;
}

// Keep `stripe` as a getter for backward compat in route files
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const PRICE_IDS = {
  hobby: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_HOBBY_MONTHLY!,
    annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_HOBBY_ANNUAL!,
  },
  pro: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY!,
    annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL!,
  },
} as const;
