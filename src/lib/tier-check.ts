import type { Tier, UserProfile } from "@/types";

type TierLimits = {
  activeCalendars: number;
  pdfExports: number;
  imageUploads: number;
  pdfExportsAreTotalCap: boolean;
  imageUploadsAreTotalCap: boolean;
  watermarkOnPdf: boolean;
  premiumTemplates: boolean;
  printOrders: boolean;
};

export const TIER_LIMITS: Record<Tier, TierLimits> = {
  trial: {
    activeCalendars: 1,
    pdfExports: 2,
    imageUploads: 20,
    pdfExportsAreTotalCap: true,
    imageUploadsAreTotalCap: true,
    watermarkOnPdf: true,
    premiumTemplates: false,
    printOrders: true,
  },
  hobby: {
    activeCalendars: 5,
    pdfExports: 10,
    imageUploads: 100,
    pdfExportsAreTotalCap: false,
    imageUploadsAreTotalCap: false,
    watermarkOnPdf: false,
    premiumTemplates: false,
    printOrders: true,
  },
  pro: {
    activeCalendars: Infinity,
    pdfExports: Infinity,
    imageUploads: 500,
    pdfExportsAreTotalCap: false,
    imageUploadsAreTotalCap: false,
    watermarkOnPdf: false,
    premiumTemplates: true,
    printOrders: true,
  },
  free: {
    activeCalendars: 0,
    pdfExports: 0,
    imageUploads: 0,
    pdfExportsAreTotalCap: true,
    imageUploadsAreTotalCap: true,
    watermarkOnPdf: true,
    premiumTemplates: false,
    printOrders: true,
  },
};

export type TierAction =
  | "createCalendar"
  | "exportPdf"
  | "uploadImage"
  | "usePremiumTemplate";

type TierCheckResult = {
  allowed: boolean;
  reason?: string;
  limit?: number;
  used?: number;
};

export function isTrialExpired(trialEndsAt: Date | null): boolean {
  if (!trialEndsAt) return false;
  return new Date() > trialEndsAt;
}

export function getEffectiveTier(profile: {
  tier: string;
  trialEndsAt: Date | null;
}): Tier {
  if (profile.tier === "trial" && isTrialExpired(profile.trialEndsAt)) {
    return "free";
  }
  return profile.tier as Tier;
}

export function canPerformAction(
  profile: UserProfile,
  action: TierAction,
  currentCount?: number
): TierCheckResult {
  const tier = getEffectiveTier(profile);
  const limits = TIER_LIMITS[tier];

  switch (action) {
    case "createCalendar": {
      if (limits.activeCalendars === 0) {
        return {
          allowed: false,
          reason: "Your plan does not allow creating calendars. Please upgrade.",
          limit: 0,
          used: currentCount,
        };
      }
      if (
        currentCount !== undefined &&
        currentCount >= limits.activeCalendars
      ) {
        return {
          allowed: false,
          reason: `You've reached your limit of ${limits.activeCalendars} active calendar(s). Please upgrade for more.`,
          limit: limits.activeCalendars,
          used: currentCount,
        };
      }
      return { allowed: true };
    }

    case "exportPdf": {
      if (limits.pdfExports === 0) {
        return {
          allowed: false,
          reason: "Your plan does not allow PDF exports. Please upgrade.",
          limit: 0,
        };
      }
      const used = limits.pdfExportsAreTotalCap
        ? profile.totalExportsUsed
        : profile.monthlyExportsUsed;
      if (used >= limits.pdfExports) {
        return {
          allowed: false,
          reason: limits.pdfExportsAreTotalCap
            ? `You've used all ${limits.pdfExports} PDF exports on your trial.`
            : `You've used all ${limits.pdfExports} PDF exports this month.`,
          limit: limits.pdfExports,
          used,
        };
      }
      return { allowed: true, limit: limits.pdfExports, used };
    }

    case "uploadImage": {
      if (limits.imageUploads === 0) {
        return {
          allowed: false,
          reason: "Your plan does not allow image uploads. Please upgrade.",
          limit: 0,
        };
      }
      if (currentCount !== undefined && currentCount >= limits.imageUploads) {
        return {
          allowed: false,
          reason: `You've reached your limit of ${limits.imageUploads} image uploads. Please upgrade for more.`,
          limit: limits.imageUploads,
          used: currentCount,
        };
      }
      return { allowed: true, limit: limits.imageUploads, used: currentCount };
    }

    case "usePremiumTemplate": {
      if (!limits.premiumTemplates) {
        return {
          allowed: false,
          reason: "Premium templates require a Pro plan.",
        };
      }
      return { allowed: true };
    }

    default:
      return { allowed: true };
  }
}

export function shouldResetMonthlyCounters(
  resetAt: Date | null
): boolean {
  if (!resetAt) return true;
  return new Date() > resetAt;
}

export function getNextMonthlyReset(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}
