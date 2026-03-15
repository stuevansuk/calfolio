"use client";

import { useState } from "react";
import type { Tier } from "@/types";
import { UpgradeModal } from "./UpgradeModal";

type TierBadgeProps = {
  tier: Tier;
  compact?: boolean;
};

const tierConfig: Record<Tier, { label: string; classes: string }> = {
  trial: {
    label: "Trial",
    classes: "bg-amber-100 text-amber-700",
  },
  hobby: {
    label: "Hobby",
    classes: "bg-rose-100 text-rose-700",
  },
  pro: {
    label: "Pro",
    classes: "bg-violet-100 text-violet-700",
  },
  free: {
    label: "Free",
    classes: "bg-stone-200 text-stone-600",
  },
};

export function TierBadge({ tier, compact = false }: TierBadgeProps) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const config = tierConfig[tier];

  const badge = (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.classes} ${
        compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
      } ${tier !== "pro" ? "cursor-pointer hover:opacity-80" : ""}`}
      onClick={tier !== "pro" ? () => setShowUpgrade(true) : undefined}
      role={tier !== "pro" ? "button" : undefined}
      tabIndex={tier !== "pro" ? 0 : undefined}
      onKeyDown={
        tier !== "pro"
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setShowUpgrade(true);
              }
            }
          : undefined
      }
    >
      {config.label}
    </span>
  );

  return (
    <>
      {badge}
      {tier !== "pro" && (
        <UpgradeModal
          isOpen={showUpgrade}
          onClose={() => setShowUpgrade(false)}
        />
      )}
    </>
  );
}
