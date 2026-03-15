"use client";

import { useState } from "react";
import { useAppStore } from "@/stores/app-store";
import { getEffectiveTier } from "@/lib/tier-check";
import { UpgradeModal } from "./UpgradeModal";

export function ExpiredTrialOverlay() {
  const user = useAppStore((s) => s.user);
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (!user) return null;

  // Only show when user originally had a trial that has now expired
  if (user.tier !== "trial") return null;

  const effectiveTier = getEffectiveTier(user);
  if (effectiveTier !== "free") return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
          {/* Icon */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-7 w-7 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="mt-5 text-center text-2xl font-bold text-stone-800 font-[family-name:var(--font-heading)]">
            Your trial has expired
          </h2>
          <p className="mt-2 text-center text-sm text-stone-500">
            Your 7-day free trial has ended. Upgrade to keep creating.
          </p>

          {/* What you lose */}
          <div className="mt-6 rounded-lg bg-stone-50 p-4">
            <p className="text-sm font-medium text-stone-700">
              Without upgrading, you can no longer:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-stone-600">
              <li className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-400"
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
                Create new calendars
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-400"
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
                Export PDFs
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-400"
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
                Upload new images
              </li>
            </ul>
          </div>

          {/* What you keep */}
          <div className="mt-3 rounded-lg bg-green-50 p-4">
            <p className="text-sm font-medium text-green-800">
              You can still:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-green-700">
              <li className="flex items-start gap-2">
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
                View your existing calendars
              </li>
              <li className="flex items-start gap-2">
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
                Order printed calendars
              </li>
            </ul>
          </div>

          {/* CTAs */}
          <div className="mt-6 space-y-3">
            <button
              onClick={() => setShowUpgrade(true)}
              className="w-full rounded-full bg-rose-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-600 focus:ring-2 focus:ring-rose-300 focus:ring-offset-2"
            >
              Upgrade Now
            </button>
            <a
              href="/pricing"
              className="block w-full rounded-full border border-stone-200 px-4 py-2.5 text-center text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              View Pricing
            </a>
          </div>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
      />
    </>
  );
}
