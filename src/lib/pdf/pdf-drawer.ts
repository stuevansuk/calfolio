import type { PDFPage, PDFFont } from "pdf-lib";
import { rgb, degrees } from "pdf-lib";
import type { DrawCommand, PageDimensions } from "@/lib/calendar/layout";

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace("#", "");
  const bigint = parseInt(cleaned, 16);
  return {
    r: ((bigint >> 16) & 255) / 255,
    g: ((bigint >> 8) & 255) / 255,
    b: (bigint & 255) / 255,
  };
}

type FontMap = Record<string, PDFFont>;

function resolveFont(fontName: string, fonts: FontMap): PDFFont {
  // Try exact match first
  if (fonts[fontName]) return fonts[fontName];

  // Map common font families to StandardFonts
  const lower = fontName.toLowerCase();
  if (lower.includes("courier") || lower.includes("mono")) {
    return fonts["Courier"] ?? fonts["Helvetica"];
  }
  if (
    lower.includes("times") ||
    lower.includes("serif") ||
    lower.includes("georgia")
  ) {
    return fonts["TimesRoman"] ?? fonts["Helvetica"];
  }
  // Default to Helvetica
  return fonts["Helvetica"];
}

function scaleSize(templateSize: number, dims: PageDimensions): number {
  // Template sizes are designed for 72 DPI. Scale proportionally.
  return templateSize * (dims.dpi / 72);
}

export function drawCommandsToPdf(
  page: PDFPage,
  commands: DrawCommand[],
  dims: PageDimensions,
  fonts: FontMap,
  scale: number = 1
): void {
  const pageHeight = dims.height * scale;

  for (const cmd of commands) {
    switch (cmd.type) {
      case "rect": {
        const c = hexToRgb(cmd.fill);
        page.drawRectangle({
          x: cmd.x * scale,
          // PDF coordinate system is bottom-left origin
          y: pageHeight - (cmd.y + cmd.height) * scale,
          width: cmd.width * scale,
          height: cmd.height * scale,
          color: rgb(c.r, c.g, c.b),
        });
        break;
      }

      case "text": {
        const c = hexToRgb(cmd.color);
        const font = resolveFont(cmd.font, fonts);
        const fontSize = scaleSize(cmd.size, dims) * scale;

        let x = cmd.x * scale;
        if (cmd.align === "center" || cmd.align === "right") {
          const textWidth = font.widthOfTextAtSize(cmd.text, fontSize);
          if (cmd.align === "center") {
            x = cmd.x * scale - textWidth / 2;
          } else {
            x = cmd.x * scale - textWidth;
          }
        }

        page.drawText(cmd.text, {
          x,
          y: pageHeight - cmd.y * scale - fontSize / 2,
          size: fontSize,
          font,
          color: rgb(c.r, c.g, c.b),
        });
        break;
      }

      case "line": {
        const c = hexToRgb(cmd.color);
        const lineWidth = cmd.width * (dims.dpi / 72) * scale;
        page.drawLine({
          start: { x: cmd.x1 * scale, y: pageHeight - cmd.y1 * scale },
          end: { x: cmd.x2 * scale, y: pageHeight - cmd.y2 * scale },
          thickness: lineWidth,
          color: rgb(c.r, c.g, c.b),
        });
        break;
      }

      case "gridCell": {
        // Background fill if specified
        if (cmd.bgColor) {
          const bgC = hexToRgb(cmd.bgColor);
          page.drawRectangle({
            x: cmd.x * scale,
            y: pageHeight - (cmd.y + cmd.height) * scale,
            width: cmd.width * scale,
            height: cmd.height * scale,
            color: rgb(bgC.r, bgC.g, bgC.b),
          });
        }

        // Centered text
        if (cmd.text) {
          const c = hexToRgb(cmd.color);
          const font = resolveFont(cmd.font, fonts);
          const fontSize = scaleSize(cmd.size, dims) * scale;
          const textWidth = font.widthOfTextAtSize(cmd.text, fontSize);
          const textX = cmd.x * scale + (cmd.width * scale - textWidth) / 2;
          const textY =
            pageHeight - (cmd.y + cmd.height / 2) * scale - fontSize / 3;

          page.drawText(cmd.text, {
            x: textX,
            y: textY,
            size: fontSize,
            font,
            color: rgb(c.r, c.g, c.b),
          });
        }
        break;
      }

      case "image": {
        // Images are handled externally by the generators since they
        // require async fetching/embedding. This case is a no-op here.
        // The generators embed images before calling drawCommandsToPdf.
        break;
      }
    }
  }
}

export function addWatermark(
  page: PDFPage,
  dims: PageDimensions,
  font: PDFFont
): void {
  const pageHeight = dims.height;
  const pageWidth = dims.width;
  const text = "Created with Calfolio";
  const fontSize = scaleSize(24, dims);
  const textWidth = font.widthOfTextAtSize(text, fontSize);

  // Draw diagonal watermark
  page.pushOperators();

  const centerX = pageWidth / 2;
  const centerY = pageHeight / 2;

  // We'll draw multiple watermark lines across the page
  const spacing = scaleSize(120, dims);
  const offsets = [-spacing * 2, -spacing, 0, spacing, spacing * 2];

  for (const offset of offsets) {
    const x = centerX - textWidth / 2;
    const y = centerY + offset;

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.8, 0.8, 0.8),
      opacity: 0.3,
      rotate: degrees(-45),
    });
  }
}

export function addCropMarks(
  page: PDFPage,
  dims: PageDimensions,
  bleedPx: number,
  scale: number = 1
): void {
  const pageHeight = dims.height * scale;
  const pageWidth = dims.width * scale;
  const bleed = bleedPx * scale;
  const markLength = bleed * 0.8;
  const markColor = rgb(0, 0, 0);
  const markThickness = 0.5 * (dims.dpi / 72) * scale;

  // Top-left corner
  // Horizontal
  page.drawLine({
    start: { x: 0, y: pageHeight - bleed },
    end: { x: markLength, y: pageHeight - bleed },
    thickness: markThickness,
    color: markColor,
  });
  // Vertical
  page.drawLine({
    start: { x: bleed, y: pageHeight },
    end: { x: bleed, y: pageHeight - markLength },
    thickness: markThickness,
    color: markColor,
  });

  // Top-right corner
  page.drawLine({
    start: { x: pageWidth - markLength, y: pageHeight - bleed },
    end: { x: pageWidth, y: pageHeight - bleed },
    thickness: markThickness,
    color: markColor,
  });
  page.drawLine({
    start: { x: pageWidth - bleed, y: pageHeight },
    end: { x: pageWidth - bleed, y: pageHeight - markLength },
    thickness: markThickness,
    color: markColor,
  });

  // Bottom-left corner
  page.drawLine({
    start: { x: 0, y: bleed },
    end: { x: markLength, y: bleed },
    thickness: markThickness,
    color: markColor,
  });
  page.drawLine({
    start: { x: bleed, y: 0 },
    end: { x: bleed, y: markLength },
    thickness: markThickness,
    color: markColor,
  });

  // Bottom-right corner
  page.drawLine({
    start: { x: pageWidth - markLength, y: bleed },
    end: { x: pageWidth, y: bleed },
    thickness: markThickness,
    color: markColor,
  });
  page.drawLine({
    start: { x: pageWidth - bleed, y: 0 },
    end: { x: pageWidth - bleed, y: markLength },
    thickness: markThickness,
    color: markColor,
  });
}
