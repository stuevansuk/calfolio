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
      <h1 className="mb-6 text-2xl font-bold">Order Printed Calendar</h1>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min={1}
              max={100}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Shipping</label>
            <div className="flex gap-3">
              {(["standard", "express"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setShippingMethod(m)}
                  className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium capitalize ${
                    shippingMethod === m
                      ? "border-black bg-black text-white"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setStep(2)}
            className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Next: Shipping Address
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Full Name</label>
            <input
              type="text"
              value={shippingName}
              onChange={(e) => setShippingName(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Address Line 1
            </label>
            <input
              type="text"
              value={address.line1}
              onChange={(e) =>
                setAddress({ ...address, line1: e.target.value })
              }
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Address Line 2
            </label>
            <input
              type="text"
              value={address.line2}
              onChange={(e) =>
                setAddress({ ...address, line2: e.target.value })
              }
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">City</label>
              <input
                type="text"
                value={address.city}
                onChange={(e) =>
                  setAddress({ ...address, city: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Postcode
              </label>
              <input
                type="text"
                value={address.postcode}
                onChange={(e) =>
                  setAddress({ ...address, postcode: e.target.value })
                }
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Country</label>
            <input
              type="text"
              value={address.country}
              onChange={(e) =>
                setAddress({ ...address, country: e.target.value })
              }
              maxLength={2}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={getQuote}
            disabled={loading || !shippingName || !address.line1}
            className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Getting quote..." : "Get Price Quote"}
          </button>
        </div>
      )}

      {step === 3 && quote && (
        <div className="space-y-4">
          <div className="rounded-lg border bg-white p-4">
            <h2 className="mb-3 font-medium">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Quantity</span>
                <span>{quantity}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="capitalize">{shippingMethod}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-medium">
                <span>Total</span>
                <span>
                  &pound;{(quote.retailPriceCents / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={placeOrder}
            disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Placing order..." : "Place Order & Pay"}
          </button>
        </div>
      )}
    </div>
  );
}
