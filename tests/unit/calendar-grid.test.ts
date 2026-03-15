import { describe, it, expect } from "vitest";
import { generateMonthGrid, generateYearGrids } from "@/lib/calendar/grid";

describe("calendar grid", () => {
  // -------------------------------------------------------------------------
  // generateMonthGrid: day counts
  // -------------------------------------------------------------------------

  describe("generateMonthGrid day counts", () => {
    it("January 2027 has 31 days", () => {
      const grid = generateMonthGrid(2027, 1);
      const allDays = grid.weeks
        .flat()
        .filter((cell) => cell.isCurrentMonth);
      expect(allDays.length).toBe(31);
    });

    it("February 2027 has 28 days (non-leap year)", () => {
      const grid = generateMonthGrid(2027, 2);
      const allDays = grid.weeks
        .flat()
        .filter((cell) => cell.isCurrentMonth);
      expect(allDays.length).toBe(28);
    });

    it("February 2028 has 29 days (leap year)", () => {
      const grid = generateMonthGrid(2028, 2);
      const allDays = grid.weeks
        .flat()
        .filter((cell) => cell.isCurrentMonth);
      expect(allDays.length).toBe(29);
    });

    it("April 2027 has 30 days", () => {
      const grid = generateMonthGrid(2027, 4);
      const allDays = grid.weeks
        .flat()
        .filter((cell) => cell.isCurrentMonth);
      expect(allDays.length).toBe(30);
    });

    it("correctly sets monthName", () => {
      const grid = generateMonthGrid(2027, 3);
      expect(grid.monthName).toBe("March");
    });

    it("correctly sets year and month", () => {
      const grid = generateMonthGrid(2027, 7);
      expect(grid.year).toBe(2027);
      expect(grid.month).toBe(7);
    });
  });

  // -------------------------------------------------------------------------
  // First day of week alignment
  // -------------------------------------------------------------------------

  describe("first day of week", () => {
    it("default (Monday) starts headers with Mon", () => {
      const grid = generateMonthGrid(2027, 1);
      expect(grid.dayHeaders[0]).toBe("Mon");
      expect(grid.dayHeaders[6]).toBe("Sun");
    });

    it("Sunday start rotates headers to start with Sun", () => {
      const grid = generateMonthGrid(2027, 1, { firstDayOfWeek: 0 });
      expect(grid.dayHeaders[0]).toBe("Sun");
      expect(grid.dayHeaders[1]).toBe("Mon");
      expect(grid.dayHeaders[6]).toBe("Sat");
    });

    it("each week has exactly 7 cells", () => {
      const grid = generateMonthGrid(2027, 1);
      for (const week of grid.weeks) {
        expect(week.length).toBe(7);
      }
    });

    it("first cell of first week aligns correctly for January 2027 (Friday start)", () => {
      // January 1, 2027 is a Friday. With Monday start, offset should be 4.
      // So first 4 cells should be non-current-month.
      const grid = generateMonthGrid(2027, 1, { firstDayOfWeek: 1 });
      const firstWeek = grid.weeks[0];
      // Days before Jan 1 should not be current month
      let leadingNonCurrent = 0;
      for (const cell of firstWeek) {
        if (!cell.isCurrentMonth) leadingNonCurrent++;
        else break;
      }
      // Jan 1 2027 is a Friday -> index 4 in Mon-start grid
      expect(leadingNonCurrent).toBe(4);
    });
  });

  // -------------------------------------------------------------------------
  // Day header formats
  // -------------------------------------------------------------------------

  describe("day header formats", () => {
    it("narrow format uses single letters", () => {
      const grid = generateMonthGrid(2027, 1, { dayHeaderFormat: "narrow" });
      expect(grid.dayHeaders).toEqual(["M", "T", "W", "T", "F", "S", "S"]);
    });

    it("short format uses three-letter abbreviations", () => {
      const grid = generateMonthGrid(2027, 1, { dayHeaderFormat: "short" });
      expect(grid.dayHeaders).toEqual([
        "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun",
      ]);
    });

    it("long format uses full day names", () => {
      const grid = generateMonthGrid(2027, 1, { dayHeaderFormat: "long" });
      expect(grid.dayHeaders).toEqual([
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
      ]);
    });

    it("narrow format with Sunday start rotates correctly", () => {
      const grid = generateMonthGrid(2027, 1, {
        dayHeaderFormat: "narrow",
        firstDayOfWeek: 0,
      });
      expect(grid.dayHeaders).toEqual(["S", "M", "T", "W", "T", "F", "S"]);
    });
  });

  // -------------------------------------------------------------------------
  // Week numbers
  // -------------------------------------------------------------------------

  describe("week numbers", () => {
    it("does not include weekNumbers by default", () => {
      const grid = generateMonthGrid(2027, 1);
      expect(grid.weekNumbers).toBeUndefined();
    });

    it("includes weekNumbers when showWeekNumbers is true", () => {
      const grid = generateMonthGrid(2027, 1, { showWeekNumbers: true });
      expect(grid.weekNumbers).toBeDefined();
      expect(grid.weekNumbers!.length).toBe(grid.weeks.length);
    });

    it("week numbers are positive integers", () => {
      const grid = generateMonthGrid(2027, 6, { showWeekNumbers: true });
      for (const wn of grid.weekNumbers!) {
        expect(wn).toBeGreaterThan(0);
        expect(Number.isInteger(wn)).toBe(true);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Weekend detection
  // -------------------------------------------------------------------------

  describe("weekend detection", () => {
    it("marks Saturday and Sunday as weekend", () => {
      const grid = generateMonthGrid(2027, 1);
      for (const week of grid.weeks) {
        for (const cell of week) {
          if (cell.isCurrentMonth) {
            const isWeekendDay = cell.dayOfWeek === 0 || cell.dayOfWeek === 6;
            expect(cell.isWeekend).toBe(isWeekendDay);
          }
        }
      }
    });
  });

  // -------------------------------------------------------------------------
  // generateYearGrids
  // -------------------------------------------------------------------------

  describe("generateYearGrids", () => {
    it("returns 12 grids", () => {
      const grids = generateYearGrids(2027);
      expect(grids.length).toBe(12);
    });

    it("default start is January through December", () => {
      const grids = generateYearGrids(2027);
      expect(grids[0].monthName).toBe("January");
      expect(grids[11].monthName).toBe("December");
    });

    it("startMonth=7 starts from July", () => {
      const grids = generateYearGrids(2027, 7);
      expect(grids[0].monthName).toBe("July");
      expect(grids[0].year).toBe(2027);
    });

    it("startMonth=7 wraps around to next year for months 1-6", () => {
      const grids = generateYearGrids(2027, 7);
      // July-December of 2027, then January-June of 2028
      expect(grids[5].monthName).toBe("December");
      expect(grids[5].year).toBe(2027);
      expect(grids[6].monthName).toBe("January");
      expect(grids[6].year).toBe(2028);
      expect(grids[11].monthName).toBe("June");
      expect(grids[11].year).toBe(2028);
    });

    it("passes options through to each grid", () => {
      const grids = generateYearGrids(2027, 1, { dayHeaderFormat: "long" });
      expect(grids[0].dayHeaders[0]).toBe("Monday");
      expect(grids[6].dayHeaders[0]).toBe("Monday");
    });
  });
});
