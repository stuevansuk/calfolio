"use client";

import { useAppStore } from "@/stores/app-store";

export default function OrdersPage() {
  const { orders } = useAppStore();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Orders</h1>

      {orders.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-500">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <a
              key={order.id}
              href={`/app/orders/${order.id}`}
              className="block rounded-lg border bg-white p-4 transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.paperSize} &middot; Qty {order.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize">
                    {order.status.replace(/_/g, " ")}
                  </span>
                  {order.retailPriceCents && (
                    <p className="mt-1 text-sm font-medium">
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
