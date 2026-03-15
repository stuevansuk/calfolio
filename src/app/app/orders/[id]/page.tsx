"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { PrintOrder } from "@/types";

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<PrintOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setOrder(res.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-rose-500" />
      </div>
    );
  }

  if (!order) {
    return <div className="py-20 text-center text-stone-500">Order not found</div>;
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-stone-800 font-[family-name:var(--font-heading)]">
        Order #{order.id.slice(0, 8)}
      </h1>

      <div className="space-y-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-medium text-stone-800">Status</h2>
          <span className="inline-block rounded-full bg-amber-50 px-3 py-1 text-sm font-medium capitalize text-amber-700">
            {order.status.replace(/_/g, " ")}
          </span>
        </div>

        {order.trackingUrl && (
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-medium text-stone-800">Tracking</h2>
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-rose-600 hover:text-rose-700 hover:underline"
            >
              Track your package &rarr;
            </a>
          </div>
        )}

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-medium text-stone-800">Details</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-stone-500">Paper Size</dt>
              <dd className="text-stone-800">{order.paperSize}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-500">Quantity</dt>
              <dd className="text-stone-800">{order.quantity}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-500">Shipping</dt>
              <dd className="capitalize text-stone-800">{order.shippingMethod}</dd>
            </div>
            {order.retailPriceCents && (
              <div className="flex justify-between border-t border-stone-100 pt-2 font-medium">
                <dt className="text-stone-800">Total</dt>
                <dd className="text-stone-800">&pound;{(order.retailPriceCents / 100).toFixed(2)}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
