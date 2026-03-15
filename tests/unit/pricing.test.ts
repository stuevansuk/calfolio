import { describe, it, expect } from "vitest";
import { calculateRetailPrice, calculateMargin } from "@/lib/print/pricing";
import { PRINT_PRICING } from "@/lib/constants";

describe("pricing", () => {
  // -------------------------------------------------------------------------
  // calculateRetailPrice
  // -------------------------------------------------------------------------

  describe("calculateRetailPrice", () => {
    it("applies 50% markup plus handling fee correctly", () => {
      // wholesale = 1000 cents (10.00)
      // markup = 1000 * 0.5 = 500
      // per-unit = 1000 + 500 + 150 = 1650
      // quantity 1 = 1650
      const result = calculateRetailPrice(1000, 1);
      expect(result).toBe(1650);
    });

    it("scales linearly with quantity", () => {
      const singlePrice = calculateRetailPrice(1000, 1);
      const doublePrice = calculateRetailPrice(1000, 2);
      expect(doublePrice).toBe(singlePrice * 2);
    });

    it("handles zero wholesale price", () => {
      // markup = 0, handling = 150
      const result = calculateRetailPrice(0, 1);
      expect(result).toBe(150);
    });

    it("handles large wholesale price", () => {
      // wholesale = 5000 (50.00)
      // markup = 5000 * 0.5 = 2500
      // per-unit = 5000 + 2500 + 150 = 7650
      // quantity 3 = 22950
      const result = calculateRetailPrice(5000, 3);
      expect(result).toBe(22950);
    });

    it("handles quantity of zero", () => {
      const result = calculateRetailPrice(1000, 0);
      expect(result).toBe(0);
    });

    it("rounds markup amount to integer cents", () => {
      // wholesale = 333 cents
      // markup = Math.round(333 * 0.5) = Math.round(166.5) = 167 (rounds to nearest)
      // per-unit = 333 + 167 + 150 = 650
      const result = calculateRetailPrice(333, 1);
      expect(result).toBe(650);
      expect(Number.isInteger(result)).toBe(true);
    });

    it("uses correct constants from PRINT_PRICING", () => {
      expect(PRINT_PRICING.markupPercent).toBe(50);
      expect(PRINT_PRICING.handlingFeeCents).toBe(150);
    });
  });

  // -------------------------------------------------------------------------
  // calculateMargin
  // -------------------------------------------------------------------------

  describe("calculateMargin", () => {
    it("returns correct margin percentage", () => {
      // retail = 1000, wholesale = 600
      // margin = (1000 - 600) / 1000 * 100 = 40%
      const result = calculateMargin(1000, 600);
      expect(result).toBe(40);
    });

    it("returns 0 when retail price is 0", () => {
      const result = calculateMargin(0, 500);
      expect(result).toBe(0);
    });

    it("returns 100 when wholesale is 0", () => {
      // margin = (1000 - 0) / 1000 * 100 = 100%
      const result = calculateMargin(1000, 0);
      expect(result).toBe(100);
    });

    it("returns negative margin when wholesale exceeds retail", () => {
      // retail = 500, wholesale = 800
      // margin = (500 - 800) / 500 * 100 = -60%
      const result = calculateMargin(500, 800);
      expect(result).toBe(-60);
    });

    it("calculates realistic margin for a typical order", () => {
      // wholesale = 2000 cents
      const retail = calculateRetailPrice(2000, 1);
      // retail = 2000 + 1000 + 150 = 3150
      const margin = calculateMargin(retail, 2000);
      // margin = (3150 - 2000) / 3150 * 100 ~= 36.51%
      expect(margin).toBeGreaterThan(36);
      expect(margin).toBeLessThan(37);
    });
  });
});
