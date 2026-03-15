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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
      </div>
    );
  }

  if (!order) {
    return <div className="py-20 text-center text-gray-500">Order not found</div>;
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold">
        Order #{order.id.slice(0, 8)}
      </h1>

      <div className="space-y-4">
        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 font-medium">Status</h2>
          <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-medium capitalize">
            {order.status.replace(/_/g, " ")}
          </span>
        </div>

        {order.trackingUrl && (
          <div className="rounded-lg border bg-white p-4">
            <h2 className="mb-3 font-medium">Tracking</h2>
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Track your package &rarr;
            </a>
          </div>
        )}

        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 font-medium">Details</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Paper Size</dt>
              <dd>{order.paperSize}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Quantity</dt>
              <dd>{order.quantity}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Shipping</dt>
              <dd className="capitalize">{order.shippingMethod}</dd>
            </div>
            {order.retailPriceCents && (
              <div className="flex justify-between border-t pt-2 font-medium">
                <dt>Total</dt>
                <dd>&pound;{(order.retailPriceCents / 100).toFixed(2)}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
