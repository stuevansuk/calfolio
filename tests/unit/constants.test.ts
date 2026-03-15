import { describe, it, expect } from "vitest";
import {
  TIER_NAMES,
  TRIAL_DURATION_DAYS,
  PAGINATION,
  BATCH_SIZES,
  SYNC_STALE_THRESHOLD_MS,
  IMAGE_CONSTRAINTS,
  CALENDAR,
  PRINT_PRICING,
} from "@/lib/constants";

describe("constants", () => {
  describe("TIER_NAMES", () => {
    it("has all 4 tiers", () => {
      expect(Object.keys(TIER_NAMES)).toEqual(
        expect.arrayContaining(["trial", "hobby", "pro", "free"])
      );
      expect(Object.keys(TIER_NAMES).length).toBe(4);
    });

    it("has human-readable display names", () => {
      expect(TIER_NAMES.trial).toBe("Trial");
      expect(TIER_NAMES.hobby).toBe("Hobby");
      expect(TIER_NAMES.pro).toBe("Pro");
      expect(TIER_NAMES.free).toBe("Free");
    });
  });

  describe("TRIAL_DURATION_DAYS", () => {
    it("is 7 days", () => {
      expect(TRIAL_DURATION_DAYS).toBe(7);
    });
  });

  describe("PAGINATION", () => {
    it("maxLimit is greater than defaultLimit", () => {
      expect(PAGINATION.maxLimit).toBeGreaterThan(PAGINATION.defaultLimit);
    });

    it("defaultLimit is 50", () => {
      expect(PAGINATION.defaultLimit).toBe(50);
    });

    it("maxLimit is 200", () => {
      expect(PAGINATION.maxLimit).toBe(200);
    });

    it("maxAll is 10000", () => {
      expect(PAGINATION.maxAll).toBe(10000);
    });
  });

  describe("CALENDAR", () => {
    it("pagesPerProject is 13 (cover + 12 months)", () => {
      expect(CALENDAR.pagesPerProject).toBe(13);
    });

    it("coverMonthIndex is 0", () => {
      expect(CALENDAR.coverMonthIndex).toBe(0);
    });
  });

  describe("IMAGE_CONSTRAINTS", () => {
    it("maxFileSizeMB is 4", () => {
      expect(IMAGE_CONSTRAINTS.maxFileSizeMB).toBe(4);
    });

    it("maxDimensionPx is 4096", () => {
      expect(IMAGE_CONSTRAINTS.maxDimensionPx).toBe(4096);
    });

    it("compressionQuality is between 0 and 1", () => {
      expect(IMAGE_CONSTRAINTS.compressionQuality).toBeGreaterThan(0);
      expect(IMAGE_CONSTRAINTS.compressionQuality).toBeLessThanOrEqual(1);
    });

    it("presignExpirySeconds is 15 minutes", () => {
      expect(IMAGE_CONSTRAINTS.presignExpirySeconds).toBe(900);
    });
  });

  describe("BATCH_SIZES", () => {
    it("imageUpload batch size is 10", () => {
      expect(BATCH_SIZES.imageUpload).toBe(10);
    });

    it("pageUpdate batch size matches calendar pages", () => {
      expect(BATCH_SIZES.pageUpdate).toBe(CALENDAR.pagesPerProject);
    });
  });

  describe("SYNC_STALE_THRESHOLD_MS", () => {
    it("is 5 minutes in milliseconds", () => {
      expect(SYNC_STALE_THRESHOLD_MS).toBe(5 * 60 * 1000);
    });
  });

  describe("PRINT_PRICING", () => {
    it("handlingFeeCents is 150 (1.50 GBP)", () => {
      expect(PRINT_PRICING.handlingFeeCents).toBe(150);
    });

    it("markupPercent is 50", () => {
      expect(PRINT_PRICING.markupPercent).toBe(50);
    });
  });
});
