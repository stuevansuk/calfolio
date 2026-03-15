"use client";

import { useState } from "react";

type UpgradeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const plans = [
  {
    tier: "hobby" as const,
    name: "Hobby",
    monthlyPrice: 5,
    annualPrice: 48,
    features: [
      "5 active calendars",
      "10 PDF exports/month",
      "100 image uploads/month",
      "No watermark on PDFs",
      "Order printed calendars",
    ],
    missingFeatures: ["Premium templates"],
  },
  {
    tier: "pro" as const,
    name: "Pro",
    monthlyPrice: 12,
    annualPrice: 115,
    popular: true,
    features: [
      "Unlimited calendars",
      "Unlimited PDF exports",
      "500 image uploads/month",
      "No watermark on PDFs",
      "Premium templates",
      "Order printed calendars",
    ],
    missingFeatures: [],
  },
];

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [interval, setInterval] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleCheckout(tier: "hobby" | "pro") {
    setLoading(tier);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, interval }),
      });
      const json = await res.json();
      if (json.success && json.data?.url) {
        window.location.href = json.data.url;
      } else if (json.success && json.data?.upgraded) {
        window.location.reload();
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-stone-800 font-[family-name:var(--font-heading)]">Upgrade your plan</h2>
            <p className="mt-1 text-sm text-stone-500">
              Choose the plan that works for you.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
            aria-label="Close"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Interval toggle */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <span
            className={`text-sm ${interval === "monthly" ? "font-medium text-stone-800" : "text-stone-500"}`}
          >
            Monthly
          </span>
          <button
            onClick={() =>
              setInterval(interval === "monthly" ? "annual" : "monthly")
            }
            className={`relative h-6 w-11 rounded-full transition-colors ${
              interval === "annual" ? "bg-rose-500" : "bg-stone-300"
            }`}
            aria-label="Toggle billing interval"
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                interval === "annual" ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span
            className={`text-sm ${interval === "annual" ? "font-medium text-stone-800" : "text-stone-500"}`}
          >
            Annual
          </span>
          {interval === "annual" && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              Save ~20%
            </span>
          )}
        </div>

        {/* Plans */}
        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.tier}
              className={`rounded-2xl border-2 p-5 ${
                plan.popular
                  ? "border-rose-300 shadow-md"
                  : "border-stone-200"
              }`}
            >
              {plan.popular && (
                <span className="mb-3 inline-block rounded-full bg-rose-500 px-2.5 py-0.5 text-xs font-medium text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-bold text-stone-800">{plan.name}</h3>
              <p className="mt-1">
                <span className="text-3xl font-bold text-stone-800">
                  &pound;
                  {interval === "monthly"
                    ? plan.monthlyPrice
                    : plan.annualPrice}
                </span>
                <span className="text-sm text-stone-500">
                  /{interval === "monthly" ? "mo" : "yr"}
                </span>
              </p>
              {interval === "annual" && (
                <p className="mt-0.5 text-xs text-stone-500">
                  &pound;{(plan.annualPrice / 12).toFixed(2)}/mo billed
                  annually
                </p>
              )}
              <ul className="mt-4 space-y-2 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-stone-700">{f}</span>
                  </li>
                ))}
                {plan.missingFeatures.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-stone-400"
                  >
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout(plan.tier)}
                disabled={loading !== null}
                className={`mt-5 w-full rounded-full px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                  plan.popular
                    ? "bg-rose-500 text-white hover:bg-rose-600"
                    : "border border-stone-200 bg-white text-stone-800 hover:bg-stone-50"
                }`}
              >
                {loading === plan.tier ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-current" />
                    Processing...
                  </span>
                ) : (
                  "Get Started"
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
