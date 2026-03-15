"use client";

import { useAppStore } from "@/stores/app-store";

export default function OrdersPage() {
  const { orders } = useAppStore();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-800 font-[family-name:var(--font-heading)]">Orders</h1>

      {orders.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-stone-200 bg-gradient-to-br from-rose-50 to-amber-50 p-12 text-center">
          <p className="text-stone-500">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <a
              key={order.id}
              href={`/app/orders/${order.id}`}
              className="block rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-stone-800">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-stone-500">
                    {order.paperSize} &middot; Qty {order.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-medium capitalize text-amber-700">
                    {order.status.replace(/_/g, " ")}
                  </span>
                  {order.retailPriceCents && (
                    <p className="mt-1 text-sm font-medium text-stone-800">
                      &pound;
                      {(order.retailPriceCents / 100).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
