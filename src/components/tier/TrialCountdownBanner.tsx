"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/stores/app-store";
import { TIER_LIMITS } from "@/lib/tier-check";
import { UpgradeModal } from "./UpgradeModal";

export function TrialCountdownBanner() {
  const user = useAppStore((s) => s.user);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const daysRemaining = useMemo(() => {
    if (!user?.trialEndsAt) return 0;
    const end = new Date(user.trialEndsAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [user?.trialEndsAt]);

  if (!user || user.tier !== "trial") return null;

  const limits = TIER_LIMITS.trial;
  const trialDays = 7;
  const daysUsed = trialDays - daysRemaining;
  const progressPercent = Math.min(100, (daysUsed / trialDays) * 100);

  const calendarsUsed = user.totalCalendarsCreated;
  const calendarsLimit = limits.activeCalendars;
  const exportsUsed = user.totalExportsUsed;
  const exportsLimit = limits.pdfExports;

  return (
    <>
      <div className="border-b border-amber-200 bg-amber-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 shrink-0 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm font-medium text-amber-700">
                {daysRemaining === 0
                  ? "Your trial ends today"
                  : daysRemaining === 1
                    ? "1 day remaining in your trial"
                    : `${daysRemaining} days remaining in your trial`}
              </p>
            </div>

            {/* Progress bar */}
            <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-amber-200">
              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Usage stats */}
            <div className="mt-1.5 flex gap-4 text-xs text-amber-600">
              <span>
                Calendars: {calendarsUsed}/{calendarsLimit}
              </span>
              <span>
                Exports: {exportsUsed}/{exportsLimit}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowUpgrade(true)}
            className="shrink-0 rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:ring-2 focus:ring-amber-300 focus:ring-offset-2"
          >
            Upgrade
          </button>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
      />
    </>
  );
}
