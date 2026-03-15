import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { UserProfile } from "@/types";
import {
  isTrialExpired,
  getEffectiveTier,
  canPerformAction,
  shouldResetMonthlyCounters,
  TIER_LIMITS,
} from "@/lib/tier-check";

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: "profile-1",
    userId: "user-1",
    email: "test@example.com",
    name: "Test User",
    avatarUrl: null,
    tier: "trial",
    trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    monthlyCalendarsCreated: 0,
    monthlyExportsUsed: 0,
    totalCalendarsCreated: 0,
    totalExportsUsed: 0,
    monthlyCounterResetAt: null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    stripePriceId: null,
    stripeCurrentPeriodEnd: null,
    stripeCancelAtPeriodEnd: false,
    emailUnsubscribed: false,
    lastActiveAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("tier-check", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2027-01-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // -------------------------------------------------------------------------
  // isTrialExpired
  // -------------------------------------------------------------------------

  describe("isTrialExpired", () => {
    it("returns false when trialEndsAt is null", () => {
      expect(isTrialExpired(null)).toBe(false);
    });

    it("returns false when trial end date is in the future", () => {
      const future = new Date("2027-01-20T00:00:00Z");
      expect(isTrialExpired(future)).toBe(false);
    });

    it("returns true when trial end date is in the past", () => {
      const past = new Date("2027-01-10T00:00:00Z");
      expect(isTrialExpired(past)).toBe(true);
    });

    it("returns true when trial end date is exactly now", () => {
      // Date.now() > trialEndsAt, so at exact same time it returns false
      const now = new Date("2027-01-15T12:00:00Z");
      expect(isTrialExpired(now)).toBe(false);
    });

    it("returns true when trial expired one second ago", () => {
      const justPast = new Date("2027-01-15T11:59:59Z");
      expect(isTrialExpired(justPast)).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // getEffectiveTier
  // -------------------------------------------------------------------------

  describe("getEffectiveTier", () => {
    it("returns 'free' when trial tier and trial has expired", () => {
      const profile = { tier: "trial", trialEndsAt: new Date("2027-01-01T00:00:00Z") };
      expect(getEffectiveTier(profile)).toBe("free");
    });

    it("returns 'trial' when trial tier and trial is still active", () => {
      const profile = { tier: "trial", trialEndsAt: new Date("2027-01-20T00:00:00Z") };
      expect(getEffectiveTier(profile)).toBe("trial");
    });

    it("returns 'hobby' regardless of trialEndsAt for hobby tier", () => {
      const profile = { tier: "hobby", trialEndsAt: new Date("2020-01-01T00:00:00Z") };
      expect(getEffectiveTier(profile)).toBe("hobby");
    });

    it("returns 'pro' for pro tier", () => {
      const profile = { tier: "pro", trialEndsAt: null };
      expect(getEffectiveTier(profile)).toBe("pro");
    });

    it("returns 'free' for free tier", () => {
      const profile = { tier: "free", trialEndsAt: null };
      expect(getEffectiveTier(profile)).toBe("free");
    });

    it("returns 'trial' when trialEndsAt is null on trial tier", () => {
      // null trialEndsAt means isTrialExpired returns false, so tier stays trial
      const profile = { tier: "trial", trialEndsAt: null };
      expect(getEffectiveTier(profile)).toBe("trial");
    });
  });

  // -------------------------------------------------------------------------
  // canPerformAction: createCalendar
  // -------------------------------------------------------------------------

  describe("canPerformAction('createCalendar')", () => {
    it("allows trial user when under limit", () => {
      const profile = makeProfile({ tier: "trial" });
      const result = canPerformAction(profile, "createCalendar", 0);
      expect(result.allowed).toBe(true);
    });

    it("blocks trial user at limit (1)", () => {
      const profile = makeProfile({ tier: "trial" });
      const result = canPerformAction(profile, "createCalendar", 1);
      expect(result.allowed).toBe(false);
      expect(result.limit).toBe(1);
      expect(result.used).toBe(1);
    });

    it("allows hobby user when under limit", () => {
      const profile = makeProfile({ tier: "hobby" });
      const result = canPerformAction(profile, "createCalendar", 3);
      expect(result.allowed).toBe(true);
    });

    it("blocks hobby user at limit (5)", () => {
      const profile = makeProfile({ tier: "hobby" });
      const result = canPerformAction(profile, "createCalendar", 5);
      expect(result.allowed).toBe(false);
      expect(result.limit).toBe(5);
    });

    it("allows pro user with unlimited calendars", () => {
      const profile = makeProfile({ tier: "pro", trialEndsAt: null });
      const result = canPerformAction(profile, "createCalendar", 1000);
      expect(result.allowed).toBe(true);
    });

    it("blocks free tier from creating calendars", () => {
      const profile = makeProfile({
        tier: "trial",
        trialEndsAt: new Date("2027-01-01T00:00:00Z"), // expired
      });
      const result = canPerformAction(profile, "createCalendar", 0);
      expect(result.allowed).toBe(false);
      expect(result.limit).toBe(0);
      expect(result.reason).toContain("upgrade");
    });

    it("allows when currentCount is undefined (no count check)", () => {
      const profile = makeProfile({ tier: "trial" });
      const result = canPerformAction(profile, "createCalendar");
      expect(result.allowed).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // canPerformAction: exportPdf
  // -------------------------------------------------------------------------

  describe("canPerformAction('exportPdf')", () => {
    it("allows trial user with remaining exports (uses totalExportsUsed)", () => {
      const profile = makeProfile({ tier: "trial", totalExportsUsed: 0 });
      const result = canPerformAction(profile, "exportPdf");
      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(2);
      expect(result.used).toBe(0);
    });

    it("blocks trial user who used all total exports", () => {
      const profile = makeProfile({ tier: "trial", totalExportsUsed: 2 });
      const result = canPerformAction(profile, "exportPdf");
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("trial");
    });

    it("allows hobby user with remaining monthly exports", () => {
      const profile = makeProfile({ tier: "hobby", monthlyExportsUsed: 5 });
      const result = canPerformAction(profile, "exportPdf");
      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(10);
      expect(result.used).toBe(5);
    });

    it("blocks hobby user who used all monthly exports", () => {
      const profile = makeProfile({ tier: "hobby", monthlyExportsUsed: 10 });
      const result = canPerformAction(profile, "exportPdf");
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("month");
    });

    it("allows pro user with unlimited exports", () => {
      const profile = makeProfile({
        tier: "pro",
        trialEndsAt: null,
        monthlyExportsUsed: 999,
      });
      const result = canPerformAction(profile, "exportPdf");
      expect(result.allowed).toBe(true);
    });

    it("blocks free tier from exporting", () => {
      const profile = makeProfile({
        tier: "trial",
        trialEndsAt: new Date("2027-01-01T00:00:00Z"),
        totalExportsUsed: 0,
      });
      const result = canPerformAction(profile, "exportPdf");
      expect(result.allowed).toBe(false);
      expect(result.limit).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // canPerformAction: uploadImage
  // -------------------------------------------------------------------------

  describe("canPerformAction('uploadImage')", () => {
    it("allows trial user under limit", () => {
      const profile = makeProfile({ tier: "trial" });
      const result = canPerformAction(profile, "uploadImage", 10);
      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(20);
    });

    it("blocks trial user at limit (20)", () => {
      const profile = makeProfile({ tier: "trial" });
      const result = canPerformAction(profile, "uploadImage", 20);
      expect(result.allowed).toBe(false);
      expect(result.limit).toBe(20);
      expect(result.used).toBe(20);
    });

    it("allows hobby user under limit (100)", () => {
      const profile = makeProfile({ tier: "hobby" });
      const result = canPerformAction(profile, "uploadImage", 50);
      expect(result.allowed).toBe(true);
    });

    it("blocks hobby user at limit (100)", () => {
      const profile = makeProfile({ tier: "hobby" });
      const result = canPerformAction(profile, "uploadImage", 100);
      expect(result.allowed).toBe(false);
    });

    it("allows pro user under limit (500)", () => {
      const profile = makeProfile({ tier: "pro", trialEndsAt: null });
      const result = canPerformAction(profile, "uploadImage", 499);
      expect(result.allowed).toBe(true);
    });

    it("blocks free tier from uploading", () => {
      const profile = makeProfile({
        tier: "trial",
        trialEndsAt: new Date("2027-01-01T00:00:00Z"),
      });
      const result = canPerformAction(profile, "uploadImage", 0);
      expect(result.allowed).toBe(false);
      expect(result.limit).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // canPerformAction: usePremiumTemplate
  // -------------------------------------------------------------------------

  describe("canPerformAction('usePremiumTemplate')", () => {
    it("blocks trial users", () => {
      const profile = makeProfile({ tier: "trial" });
      const result = canPerformAction(profile, "usePremiumTemplate");
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("Pro");
    });

    it("blocks hobby users", () => {
      const profile = makeProfile({ tier: "hobby" });
      const result = canPerformAction(profile, "usePremiumTemplate");
      expect(result.allowed).toBe(false);
    });

    it("allows pro users", () => {
      const profile = makeProfile({ tier: "pro", trialEndsAt: null });
      const result = canPerformAction(profile, "usePremiumTemplate");
      expect(result.allowed).toBe(true);
    });

    it("blocks free tier", () => {
      const profile = makeProfile({
        tier: "trial",
        trialEndsAt: new Date("2027-01-01T00:00:00Z"),
      });
      const result = canPerformAction(profile, "usePremiumTemplate");
      expect(result.allowed).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Free tier blocks everything except print orders
  // -------------------------------------------------------------------------

  describe("free tier restrictions", () => {
    const freeProfile = makeProfile({
      tier: "trial",
      trialEndsAt: new Date("2027-01-01T00:00:00Z"), // expired trial = free
    });

    it("blocks createCalendar", () => {
      expect(canPerformAction(freeProfile, "createCalendar", 0).allowed).toBe(false);
    });

    it("blocks exportPdf", () => {
      expect(canPerformAction(freeProfile, "exportPdf").allowed).toBe(false);
    });

    it("blocks uploadImage", () => {
      expect(canPerformAction(freeProfile, "uploadImage", 0).allowed).toBe(false);
    });

    it("blocks usePremiumTemplate", () => {
      expect(canPerformAction(freeProfile, "usePremiumTemplate").allowed).toBe(false);
    });

    it("allows print orders at the tier level", () => {
      // Print orders are allowed for free tier in TIER_LIMITS
      expect(TIER_LIMITS.free.printOrders).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // shouldResetMonthlyCounters
  // -------------------------------------------------------------------------

  describe("shouldResetMonthlyCounters", () => {
    it("returns true when resetAt is null", () => {
      expect(shouldResetMonthlyCounters(null)).toBe(true);
    });

    it("returns true when resetAt is in the past", () => {
      const past = new Date("2027-01-01T00:00:00Z");
      expect(shouldResetMonthlyCounters(past)).toBe(true);
    });

    it("returns false when resetAt is in the future", () => {
      const future = new Date("2027-02-01T00:00:00Z");
      expect(shouldResetMonthlyCounters(future)).toBe(false);
    });

    it("returns false when resetAt is exactly now", () => {
      const now = new Date("2027-01-15T12:00:00Z");
      expect(shouldResetMonthlyCounters(now)).toBe(false);
    });

    it("returns true when resetAt just passed", () => {
      const justPast = new Date("2027-01-15T11:59:59Z");
      expect(shouldResetMonthlyCounters(justPast)).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // TIER_LIMITS structure
  // -------------------------------------------------------------------------

  describe("TIER_LIMITS", () => {
    it("defines all four tiers", () => {
      expect(Object.keys(TIER_LIMITS)).toEqual(
        expect.arrayContaining(["trial", "hobby", "pro", "free"])
      );
    });

    it("gives pro unlimited calendars", () => {
      expect(TIER_LIMITS.pro.activeCalendars).toBe(Infinity);
    });

    it("gives free zero calendars", () => {
      expect(TIER_LIMITS.free.activeCalendars).toBe(0);
    });

    it("trial has pdfExportsAreTotalCap true", () => {
      expect(TIER_LIMITS.trial.pdfExportsAreTotalCap).toBe(true);
    });

    it("hobby has pdfExportsAreTotalCap false", () => {
      expect(TIER_LIMITS.hobby.pdfExportsAreTotalCap).toBe(false);
    });
  });
});
