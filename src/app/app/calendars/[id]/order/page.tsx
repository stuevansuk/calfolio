"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [quantity, setQuantity] = useState(1);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">(
    "standard"
  );
  const [shippingName, setShippingName] = useState("");
  const [address, setAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postcode: "",
    country: "GB",
  });
  const [quote, setQuote] = useState<{
    retailPriceCents: number;
    wholesalePriceCents: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function getQuote() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: id,
          quantity,
          shippingMethod,
          destinationCountryCode: address.country,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuote(data.data);
        setStep(3);
      }
    } finally {
      setLoading(false);
    }
  }

  async function placeOrder() {
    if (!quote) return;
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: id,
          quantity,
          shippingName,
          shippingAddress: address,
          shippingMethod,
          wholesalePriceCents: quote.wholesalePriceCents,
          retailPriceCents: quote.retailPriceCents,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/app/orders/${data.data.orderId}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-stone-800 font-[family-name:var(--font-heading)]">Order Printed Calendar</h1>

      {/* Step indicators */}
      <div className="mb-8 flex items-center gap-3">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              step >= s ? "bg-rose-500 text-white" : "bg-stone-200 text-stone-500"
            }`}
          >
            {s}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min={1}
              max={100}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-rose-300 focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Shipping</label>
            <div className="flex gap-3">
              {(["standard", "express"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setShippingMethod(m)}
                  className={`flex-1 rounded-full border px-4 py-2 text-sm font-medium capitalize ${
                    shippingMethod === m
                      ? "border-rose-500 bg-rose-500 text-white"
                      : "border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setStep(2)}
            className="w-full rounded-full bg-rose-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-600 focus:ring-2 focus:ring-rose-300 focus:ring-offset-2"
          >
            Next: Shipping Address
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Full Name</label>
            <input
              type="text"
              value={shippingName}
              onChange={(e) => setShippingName(e.target.value)}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-rose-300 focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Address Line 1
            </label>
            <input
              type="text"
              value={address.line1}
              onChange={(e) =>
                setAddress({ ...address, line1: e.target.value })
              }
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-rose-300 focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Address Line 2
            </label>
            <input
              type="text"
              value={address.line2}
              onChange={(e) =>
                setAddress({ ...address, line2: e.target.value })
              }
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-rose-300 focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">City</label>
              <input
                type="text"
                value={address.city}
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-rose-300 focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">
                Postcode
              </label>
              <input
                type="text"
                value={address.postcode}
                onChange={(e) =>
                  setAddress({ ...address, postcode: e.target.value })
                }
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-rose-300 focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Country</label>
            <input
              type="text"
              value={address.country}
              onChange={(e) =>
                setAddress({ ...address, country: e.target.value })
              }
              maxLength={2}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-rose-300 focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 focus:outline-none"
            />
          </div>
          <button
            onClick={getQuote}
            disabled={loading || !shippingName || !address.line1}
            className="w-full rounded-full bg-rose-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-600 disabled:opacity-50 focus:ring-2 focus:ring-rose-300 focus:ring-offset-2"
          >
            {loading ? "Getting quote..." : "Get Price Quote"}
          </button>
        </div>
      )}

      {step === 3 && quote && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-medium text-stone-800">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">Quantity</span>
                <span className="text-stone-800">{quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Shipping</span>
                <span className="capitalize text-stone-800">{shippingMethod}</span>
              </div>
              <div className="flex justify-between border-t border-stone-100 pt-2 font-medium">
                <span className="text-stone-800">Total</span>
                <span className="text-stone-800">
                  &pound;{(quote.retailPriceCents / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={placeOrder}
            disabled={loading}
            className="w-full rounded-full bg-rose-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-600 disabled:opacity-50 focus:ring-2 focus:ring-rose-300 focus:ring-offset-2"
          >
            {loading ? "Placing order..." : "Place Order & Pay"}
          </button>
        </div>
      )}
    </div>
  );
}
