import type { TemplateConfig, LayoutRect } from "@/types";

export type DrawCommand =
  | { type: "rect"; x: number; y: number; width: number; height: number; fill: string }
  | { type: "image"; x: number; y: number; width: number; height: number; imageUrl: string; cropData?: Record<string, unknown> }
  | { type: "text"; x: number; y: number; text: string; font: string; size: number; color: string; align?: "left" | "center" | "right" }
  | { type: "line"; x1: number; y1: number; x2: number; y2: number; color: string; width: number }
  | { type: "gridCell"; x: number; y: number; width: number; height: number; text: string; isWeekend: boolean; isHeader: boolean; font: string; size: number; color: string; bgColor?: string };

export type PageDimensions = {
  width: number;
  height: number;
  bleedMm: number;
  dpi: number;
};

const PAPER_SIZES_MM: Record<string, { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
};

export function getPageDimensions(
  paperSize: string,
  orientation: string,
  dpi: number,
  bleedMm: number
): PageDimensions {
  const base = PAPER_SIZES_MM[paperSize] || PAPER_SIZES_MM.A4;
  let width = base.width;
  let height = base.height;

  if (orientation === "landscape") {
    [width, height] = [height, width];
  }

  // Add bleed
  width += bleedMm * 2;
  height += bleedMm * 2;

  // Convert mm to pixels at DPI
  const pxPerMm = dpi / 25.4;
  return {
    width: Math.round(width * pxPerMm),
    height: Math.round(height * pxPerMm),
    bleedMm,
    dpi,
  };
}

function rectToPixels(rect: LayoutRect, dims: PageDimensions): { x: number; y: number; width: number; height: number } {
  return {
    x: (rect.x / 100) * dims.width,
    y: (rect.y / 100) * dims.height,
    width: (rect.width / 100) * dims.width,
    height: (rect.height / 100) * dims.height,
  };
}

export function generateCoverCommands(
  config: TemplateConfig,
  dims: PageDimensions,
  data: {
    title: string;
    year: number;
    imageUrl?: string;
    cropData?: Record<string, unknown>;
  }
): DrawCommand[] {
  const commands: DrawCommand[] = [];

  // Background
  commands.push({
    type: "rect",
    x: 0,
    y: 0,
    width: dims.width,
    height: dims.height,
    fill: config.colors.background,
  });

  // Image
  if (data.imageUrl) {
    const imageRect = rectToPixels(config.coverLayout.imageArea, dims);
    commands.push({
      type: "image",
      ...imageRect,
      imageUrl: data.imageUrl,
      cropData: data.cropData,
    });
  }

  // Title
  const titleRect = rectToPixels(config.coverLayout.titleArea, dims);
  commands.push({
    type: "text",
    x: titleRect.x + titleRect.width / 2,
    y: titleRect.y + titleRect.height / 2,
    text: data.title,
    font: config.typography.yearFont,
    size: config.typography.yearSize,
    color: config.colors.text,
    align: "center",
  });

  // Year
  const yearRect = rectToPixels(config.coverLayout.yearArea, dims);
  commands.push({
    type: "text",
    x: yearRect.x + yearRect.width / 2,
    y: yearRect.y + yearRect.height / 2,
    text: String(data.year),
    font: config.typography.yearFont,
    size: config.typography.yearSize,
    color: config.colors.accent,
    align: "center",
  });

  return commands;
}

export function generateMonthPageCommands(
  config: TemplateConfig,
  dims: PageDimensions,
  data: {
    monthName: string;
    dayHeaders: string[];
    weeks: { date: number; isCurrentMonth: boolean; isWeekend: boolean }[][];
    imageUrl?: string;
    cropData?: Record<string, unknown>;
    overlayText?: string;
  }
): DrawCommand[] {
  const commands: DrawCommand[] = [];

  // Background
  commands.push({
    type: "rect",
    x: 0,
    y: 0,
    width: dims.width,
    height: dims.height,
    fill: config.colors.background,
  });

  // Image
  if (data.imageUrl) {
    const imageRect = rectToPixels(config.monthLayout.imageArea, dims);
    commands.push({
      type: "image",
      ...imageRect,
      imageUrl: data.imageUrl,
      cropData: data.cropData,
    });
  }

  // Month title
  const titleRect = rectToPixels(config.monthLayout.monthTitleArea, dims);
  commands.push({
    type: "text",
    x: titleRect.x + titleRect.width / 2,
    y: titleRect.y + titleRect.height / 2,
    text: data.monthName,
    font: config.typography.monthTitleFont,
    size: config.typography.monthTitleSize,
    color: config.colors.text,
    align: "center",
  });

  // Calendar grid
  const gridRect = rectToPixels(config.monthLayout.calendarGridArea, dims);
  const colWidth = gridRect.width / 7;
  const totalRows = data.weeks.length + 1; // +1 for header
  const rowHeight = gridRect.height / totalRows;

  // Day headers
  for (let i = 0; i < data.dayHeaders.length; i++) {
    commands.push({
      type: "gridCell",
      x: gridRect.x + i * colWidth,
      y: gridRect.y,
      width: colWidth,
      height: rowHeight,
      text: data.dayHeaders[i],
      isWeekend: i >= 5,
      isHeader: true,
      font: config.typography.dayFont,
      size: config.typography.daySize,
      color: config.colors.accent,
    });
  }

  // Day cells
  for (let w = 0; w < data.weeks.length; w++) {
    for (let d = 0; d < data.weeks[w].length; d++) {
      const cell = data.weeks[w][d];
      commands.push({
        type: "gridCell",
        x: gridRect.x + d * colWidth,
        y: gridRect.y + (w + 1) * rowHeight,
        width: colWidth,
        height: rowHeight,
        text: cell.isCurrentMonth ? String(cell.date) : "",
        isWeekend: cell.isWeekend,
        isHeader: false,
        font: config.typography.dayFont,
        size: config.typography.daySize,
        color: cell.isWeekend ? config.colors.accent : config.colors.text,
        bgColor: cell.isWeekend ? config.colors.weekendHighlight : undefined,
      });
    }
  }

  // Grid lines
  for (let i = 0; i <= 7; i++) {
    commands.push({
      type: "line",
      x1: gridRect.x + i * colWidth,
      y1: gridRect.y,
      x2: gridRect.x + i * colWidth,
      y2: gridRect.y + gridRect.height,
      color: config.colors.gridLines,
      width: 0.5,
    });
  }
  for (let i = 0; i <= totalRows; i++) {
    commands.push({
      type: "line",
      x1: gridRect.x,
      y1: gridRect.y + i * rowHeight,
      x2: gridRect.x + gridRect.width,
      y2: gridRect.y + i * rowHeight,
      color: config.colors.gridLines,
      width: 0.5,
    });
  }

  // Overlay text
  if (data.overlayText) {
    const imageRect = rectToPixels(config.monthLayout.imageArea, dims);
    commands.push({
      type: "text",
      x: imageRect.x + imageRect.width / 2,
      y: imageRect.y + imageRect.height - 20,
      text: data.overlayText,
      font: config.typography.monthTitleFont,
      size: config.typography.monthTitleSize * 0.6,
      color: "#FFFFFF",
      align: "center",
    });
  }

  return commands;
}
