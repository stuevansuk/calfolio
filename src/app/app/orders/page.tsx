"use client";

import { useAppStore } from "@/stores/app-store";

export default function OrdersPage() {
  const { orders } = useAppStore();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800 font-[family-name:var(--font-heading)]">
          Orders
        </h1>
        {orders.length > 0 && (
          <p className="mt-1 text-sm text-stone-500">
            {orders.length} order{orders.length !== 1 ? "s" : ""} in your history
          </p>
        )}
      </div>

      <div className="h-px bg-stone-100" />

      {orders.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-stone-200 bg-gradient-to-br from-rose-50 to-amber-50 px-6 py-16 text-center mt-6">
          {/* Package / calendar illustration */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Box body */}
              <rect x="12" y="30" width="48" height="36" rx="4" fill="white" stroke="#d6d3d1" strokeWidth="2" />
              {/* Box lid */}
              <path d="M8 22h56a4 4 0 014 4v4H8v-4a4 4 0 010-4z" fill="#e7e5e4" stroke="#d6d3d1" strokeWidth="2" />
              {/* Box stripe */}
              <rect x="32" y="22" width="8" height="44" fill="#fecdd3" opacity="0.6" />
              {/* Ribbon bow */}
              <ellipse cx="32" cy="20" rx="6" ry="4" fill="#fb7185" opacity="0.8" />
              <ellipse cx="40" cy="20" rx="6" ry="4" fill="#fb7185" opacity="0.8" />
              <circle cx="36" cy="20" r="2.5" fill="#e11d48" opacity="0.7" />
              {/* Calendar peeking out */}
              <rect x="22" y="12" width="16" height="14" rx="2" fill="#fef3c7" stroke="#d97706" strokeWidth="1" opacity="0.7" />
              <rect x="22" y="12" width="16" height="5" rx="2" fill="#fbbf24" opacity="0.6" />
              <rect x="22" y="15" width="16" height="2" fill="#fbbf24" opacity="0.6" />
              {/* Small grid on calendar */}
              <circle cx="27" cy="21" r="1" fill="#d97706" opacity="0.5" />
              <circle cx="30" cy="21" r="1" fill="#d97706" opacity="0.5" />
              <circle cx="33" cy="21" r="1" fill="#d97706" opacity="0.5" />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-stone-800 font-[family-name:var(--font-heading)]">
            No orders yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">
            When you order printed calendars, they'll appear here. You can track shipping, view receipts, and reorder.
          </p>

          <a
            href="/app"
            className="mt-6 inline-block rounded-full bg-rose-500 px-6 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-rose-600 focus:ring-2 focus:ring-rose-300 focus:ring-offset-2"
          >
            Browse My Calendars
          </a>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <a
              key={order.id}
              href={`/app/orders/${order.id}`}
              className="block rounded-2xl bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
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
