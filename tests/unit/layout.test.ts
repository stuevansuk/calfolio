import { describe, it, expect } from "vitest";
import {
  getPageDimensions,
  generateCoverCommands,
  generateMonthPageCommands,
} from "@/lib/calendar/layout";
import type { TemplateConfig } from "@/types";

function makeTemplateConfig(overrides: Partial<TemplateConfig> = {}): TemplateConfig {
  return {
    orientation: "portrait",
    supportedSizes: ["A4", "A5"],
    coverLayout: {
      imageArea: { x: 5, y: 5, width: 90, height: 60 },
      titleArea: { x: 10, y: 70, width: 80, height: 10 },
      yearArea: { x: 10, y: 82, width: 80, height: 10 },
    },
    monthLayout: {
      imageArea: { x: 5, y: 5, width: 90, height: 45 },
      calendarGridArea: { x: 5, y: 55, width: 90, height: 40 },
      monthTitleArea: { x: 5, y: 50, width: 90, height: 5 },
    },
    typography: {
      monthTitleFont: "Helvetica",
      monthTitleSize: 24,
      dayFont: "Arial",
      daySize: 12,
      yearFont: "Helvetica",
      yearSize: 36,
    },
    colors: {
      background: "#FFFFFF",
      text: "#000000",
      accent: "#333333",
      gridLines: "#CCCCCC",
      weekendHighlight: "#F0F0F0",
    },
    grid: {
      showWeekNumbers: false,
      firstDayOfWeek: 1,
      dayHeaderFormat: "short",
    },
    bleed: 3,
    dpi: 300,
    ...overrides,
  };
}

describe("layout", () => {
  // -------------------------------------------------------------------------
  // getPageDimensions
  // -------------------------------------------------------------------------

  describe("getPageDimensions", () => {
    it("A4 portrait at 300 DPI produces correct pixel dimensions", () => {
      const dims = getPageDimensions("A4", "portrait", 300, 0);
      // A4 = 210mm x 297mm, 300 DPI, pxPerMm = 300/25.4 ~= 11.811
      // width = Math.round(210 * 11.811) = Math.round(2480.31) = 2480
      // height = Math.round(297 * 11.811) = Math.round(3507.87) = 3508
      expect(dims.width).toBe(2480);
      expect(dims.height).toBe(3508);
      expect(dims.dpi).toBe(300);
      expect(dims.bleedMm).toBe(0);
    });

    it("A5 landscape swaps width and height", () => {
      const portrait = getPageDimensions("A5", "portrait", 300, 0);
      const landscape = getPageDimensions("A5", "landscape", 300, 0);

      // In landscape, the width and height should be swapped
      expect(landscape.width).toBe(portrait.height);
      expect(landscape.height).toBe(portrait.width);
    });

    it("bleed adds correct extra pixels on each side", () => {
      const noBleed = getPageDimensions("A4", "portrait", 300, 0);
      const withBleed = getPageDimensions("A4", "portrait", 300, 3);

      // 3mm bleed on each side = 6mm total per dimension
      // 6mm * (300/25.4) ~= 70.87 ~= 71 pixels
      const expectedExtraWidth = Math.round(6 * (300 / 25.4));
      const expectedExtraHeight = Math.round(6 * (300 / 25.4));

      // Due to rounding, check approximately
      expect(withBleed.width - noBleed.width).toBeCloseTo(expectedExtraWidth, 0);
      expect(withBleed.height - noBleed.height).toBeCloseTo(expectedExtraHeight, 0);
    });

    it("returns correct bleedMm and dpi metadata", () => {
      const dims = getPageDimensions("A4", "portrait", 150, 5);
      expect(dims.bleedMm).toBe(5);
      expect(dims.dpi).toBe(150);
    });

    it("falls back to A4 for unknown paper size", () => {
      const unknown = getPageDimensions("Letter", "portrait", 300, 0);
      const a4 = getPageDimensions("A4", "portrait", 300, 0);
      expect(unknown.width).toBe(a4.width);
      expect(unknown.height).toBe(a4.height);
    });

    it("A5 portrait at 300 DPI produces correct dimensions", () => {
      const dims = getPageDimensions("A5", "portrait", 300, 0);
      // A5 = 148mm x 210mm
      // width = Math.round(148 * 300/25.4) = Math.round(1748.03) = 1748
      // height = Math.round(210 * 300/25.4) = Math.round(2480.31) = 2480
      expect(dims.width).toBe(1748);
      expect(dims.height).toBe(2480);
    });
  });

  // -------------------------------------------------------------------------
  // generateCoverCommands
  // -------------------------------------------------------------------------

  describe("generateCoverCommands", () => {
    it("returns rect + text commands", () => {
      const config = makeTemplateConfig();
      const dims = getPageDimensions("A4", "portrait", 300, 0);
      const commands = generateCoverCommands(config, dims, {
        title: "My Calendar",
        year: 2027,
      });

      // Should have at least background rect, title text, year text
      const rects = commands.filter((c) => c.type === "rect");
      const texts = commands.filter((c) => c.type === "text");

      expect(rects.length).toBeGreaterThanOrEqual(1);
      expect(texts.length).toBeGreaterThanOrEqual(2); // title + year
    });

    it("includes image command when imageUrl is provided", () => {
      const config = makeTemplateConfig();
      const dims = getPageDimensions("A4", "portrait", 300, 0);
      const commands = generateCoverCommands(config, dims, {
        title: "My Calendar",
        year: 2027,
        imageUrl: "https://example.com/photo.jpg",
      });

      const images = commands.filter((c) => c.type === "image");
      expect(images.length).toBe(1);
    });

    it("does not include image command when no imageUrl", () => {
      const config = makeTemplateConfig();
      const dims = getPageDimensions("A4", "portrait", 300, 0);
      const commands = generateCoverCommands(config, dims, {
        title: "Test",
        year: 2027,
      });

      const images = commands.filter((c) => c.type === "image");
      expect(images.length).toBe(0);
    });

    it("background rect covers full page dimensions", () => {
      const config = makeTemplateConfig();
      const dims = getPageDimensions("A4", "portrait", 300, 0);
      const commands = generateCoverCommands(config, dims, {
        title: "Test",
        year: 2027,
      });

      const bg = commands.find((c) => c.type === "rect") as Extract<
        (typeof commands)[number],
        { type: "rect" }
      >;
      expect(bg.x).toBe(0);
      expect(bg.y).toBe(0);
      expect(bg.width).toBe(dims.width);
      expect(bg.height).toBe(dims.height);
      expect(bg.fill).toBe(config.colors.background);
    });

    it("title text uses config typography settings", () => {
      const config = makeTemplateConfig();
      const dims = getPageDimensions("A4", "portrait", 300, 0);
      const commands = generateCoverCommands(config, dims, {
        title: "My Calendar 2027",
        year: 2027,
      });

      const titleCmd = commands.find(
        (c) => c.type === "text" && c.text === "My Calendar 2027"
      ) as Extract<(typeof commands)[number], { type: "text" }>;
      expect(titleCmd).toBeDefined();
      expect(titleCmd.font).toBe(config.typography.yearFont);
      expect(titleCmd.align).toBe("center");
    });
  });

  // -------------------------------------------------------------------------
  // generateMonthPageCommands
  // -------------------------------------------------------------------------

  describe("generateMonthPageCommands", () => {
    const sampleWeeks = [
      [
        { date: 0, isCurrentMonth: false, isWeekend: false },
        { date: 0, isCurrentMonth: false, isWeekend: false },
        { date: 0, isCurrentMonth: false, isWeekend: false },
        { date: 0, isCurrentMonth: false, isWeekend: false },
        { date: 1, isCurrentMonth: true, isWeekend: false },
        { date: 2, isCurrentMonth: true, isWeekend: true },
        { date: 3, isCurrentMonth: true, isWeekend: true },
      ],
      [
        { date: 4, isCurrentMonth: true, isWeekend: false },
        { date: 5, isCurrentMonth: true, isWeekend: false },
        { date: 6, isCurrentMonth: true, isWeekend: false },
        { date: 7, isCurrentMonth: true, isWeekend: false },
        { date: 8, isCurrentMonth: true, isWeekend: false },
        { date: 9, isCurrentMonth: true, isWeekend: true },
        { date: 10, isCurrentMonth: true, isWeekend: true },
      ],
    ];

    it("returns grid cells for day headers and all days", () => {
      const config = makeTemplateConfig();
      const dims = getPageDimensions("A4", "portrait", 300, 0);

      const commands = generateMonthPageCommands(config, dims, {
        monthName: "January",
        dayHeaders: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        weeks: sampleWeeks,
      });

      const gridCells = commands.filter((c) => c.type === "gridCell");
      // 7 headers + 2 weeks * 7 days = 21
      expect(gridCells.length).toBe(7 + 2 * 7);
    });

    it("marks header cells correctly", () => {
      const config = makeTemplateConfig();
      const dims = getPageDimensions("A4", "portrait", 300, 0);

      const commands = generateMonthPageCommands(config, dims, {
        monthName: "January",
        dayHeaders: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        weeks: sampleWeeks,
      });

      const headerCells = commands.filter(
        (c) => c.type === "gridCell" && c.isHeader
      );
      expect(headerCells.length).toBe(7);
    });

    it("includes grid lines", () => {
      const config = makeTemplateConfig();
      const dims = getPageDimensions("A4", "portrait", 300, 0);

      const commands = generateMonthPageCommands(config, dims, {
        monthName: "January",
        dayHeaders: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        weeks: sampleWeeks,
      });

      const lines = commands.filter((c) => c.type === "line");
      // 8 vertical lines (0-7) + (2+1+1) horizontal lines = varies
      expect(lines.length).toBeGreaterThan(0);
    });

    it("includes month title text", () => {
      const config = makeTemplateConfig();
      const dims = getPageDimensions("A4", "portrait", 300, 0);

      const commands = generateMonthPageCommands(config, dims, {
        monthName: "March",
        dayHeaders: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        weeks: sampleWeeks,
      });

      const titleCmd = commands.find(
        (c) => c.type === "text" && c.text === "March"
      );
      expect(titleCmd).toBeDefined();
    });

    it("includes overlay text when provided", () => {
      const config = makeTemplateConfig();
      const dims = getPageDimensions("A4", "portrait", 300, 0);

      const commands = generateMonthPageCommands(config, dims, {
        monthName: "January",
        dayHeaders: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        weeks: sampleWeeks,
        overlayText: "Happy New Year!",
      });

      const overlay = commands.find(
        (c) => c.type === "text" && c.text === "Happy New Year!"
      );
      expect(overlay).toBeDefined();
    });

    it("does not include overlay text when not provided", () => {
      const config = makeTemplateConfig();
      const dims = getPageDimensions("A4", "portrait", 300, 0);

      const commands = generateMonthPageCommands(config, dims, {
        monthName: "January",
        dayHeaders: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        weeks: sampleWeeks,
      });

      // Only month title and possibly year should be text commands
      const textCmds = commands.filter((c) => c.type === "text");
      const hasOverlay = textCmds.some(
        (c) => c.type === "text" && c.color === "#FFFFFF"
      );
      expect(hasOverlay).toBe(false);
    });

    it("weekend cells have accent color and highlight background", () => {
      const config = makeTemplateConfig();
      const dims = getPageDimensions("A4", "portrait", 300, 0);

      const commands = generateMonthPageCommands(config, dims, {
        monthName: "January",
        dayHeaders: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        weeks: sampleWeeks,
      });

      const weekendDayCells = commands.filter(
        (c) => c.type === "gridCell" && !c.isHeader && c.isWeekend
      );
      for (const cell of weekendDayCells) {
        if (cell.type === "gridCell") {
          expect(cell.color).toBe(config.colors.accent);
          expect(cell.bgColor).toBe(config.colors.weekendHighlight);
        }
      }
    });
  });
});
