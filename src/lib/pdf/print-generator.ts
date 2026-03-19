import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import type { CalendarProject, CalendarPage, TemplateConfig } from "@/types";
import {
  getPageDimensions,
  generateCoverCommands,
  generateMonthPageCommands,
} from "@/lib/calendar/layout";
import type { DrawCommand } from "@/lib/calendar/layout";
import { generateMonthGrid } from "@/lib/calendar/grid";
import { drawCommandsToPdf, addCropMarks } from "@/lib/pdf/pdf-drawer";

const PRINT_DPI = 300;
const PRINT_BLEED_MM = 3;
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const LOCAL_SERVE_PREFIX = "/api/images/serve/";

async function fetchImageBuffer(url: string): Promise<Buffer> {
  // Local storage: read directly from disk instead of HTTP roundtrip
  if (url.startsWith(LOCAL_SERVE_PREFIX)) {
    const key = decodeURIComponent(url.slice(LOCAL_SERVE_PREFIX.length));
    const filePath = path.resolve(UPLOADS_DIR, key);
    if (!filePath.startsWith(UPLOADS_DIR)) {
      throw new Error("Invalid image path");
    }
    return fs.readFileSync(filePath);
  }

  // Absolute URL: fetch via HTTP (R2 or external)
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${url} (${response.status})`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function processImageForPrint(
  imageBuffer: Buffer,
  targetWidth: number,
  targetHeight: number
): Promise<{ bytes: Uint8Array; format: "jpeg" | "png" }> {
  // Use Sharp to resize to exact print pixel dimensions and convert to JPEG
  // for optimal file size at print quality
  const processed = await sharp(imageBuffer)
    .resize(Math.round(targetWidth), Math.round(targetHeight), {
      fit: "cover",
      position: "centre",
    })
    .jpeg({ quality: 95 })
    .toBuffer();

  return {
    bytes: new Uint8Array(processed),
    format: "jpeg",
  };
}

export async function generatePrintPdf(
  project: CalendarProject,
  pages: CalendarPage[],
  templateConfig: TemplateConfig
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();

  // Set PDF metadata
  pdfDoc.setTitle(`${project.title} - ${project.calendarYear}`);
  pdfDoc.setProducer("Calfolio");
  pdfDoc.setCreator("Calfolio");

  // Embed standard fonts
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);

  const fonts: Record<string, typeof helvetica> = {
    Helvetica: helvetica,
    HelveticaBold: helveticaBold,
    TimesRoman: timesRoman,
    Courier: courier,
  };

  // Layout calculations use pixel dimensions at 300 DPI
  const dims = getPageDimensions(
    project.paperSize,
    project.orientation,
    PRINT_DPI,
    PRINT_BLEED_MM
  );

  // PDF pages use points (1 pt = 1/72 inch). Convert pixel coords to points.
  const scale = 72 / PRINT_DPI;
  const pageWidthPt = dims.width * scale;
  const pageHeightPt = dims.height * scale;

  const bleedPx = Math.round((PRINT_BLEED_MM / 25.4) * PRINT_DPI);

  // Sort pages by sortOrder
  const sortedPages = [...pages].sort((a, b) => a.sortOrder - b.sortOrder);

  // Find cover page (monthIndex === 0)
  const coverPage = sortedPages.find((p) => p.monthIndex === 0);
  const monthPages = sortedPages.filter((p) => p.monthIndex > 0);

  // Generate cover page
  if (coverPage) {
    const pdfPage = pdfDoc.addPage([pageWidthPt, pageHeightPt]);
    const coverCommands = generateCoverCommands(templateConfig, dims, {
      title: project.title,
      year: project.calendarYear,
      imageUrl: coverPage.imageUrl ?? undefined,
      cropData: coverPage.imageCropData ?? undefined,
    });

    // Process and embed images at print quality
    await embedPrintImages(pdfDoc, pdfPage, coverCommands, dims, scale);

    // Draw non-image commands
    drawCommandsToPdf(pdfPage, coverCommands, dims, fonts, scale);

    // Add crop marks
    addCropMarks(pdfPage, dims, bleedPx, scale);
  }

  // Generate month pages
  for (const monthPage of monthPages) {
    const pdfPage = pdfDoc.addPage([pageWidthPt, pageHeightPt]);

    const gridData = generateMonthGrid(
      project.calendarYear,
      monthPage.monthIndex,
      {
        firstDayOfWeek: templateConfig.grid.firstDayOfWeek,
        dayHeaderFormat: templateConfig.grid.dayHeaderFormat,
        showWeekNumbers: templateConfig.grid.showWeekNumbers,
      }
    );

    const monthCommands = generateMonthPageCommands(templateConfig, dims, {
      monthName: gridData.monthName,
      dayHeaders: gridData.dayHeaders,
      weeks: gridData.weeks,
      imageUrl: monthPage.imageUrl ?? undefined,
      cropData: monthPage.imageCropData ?? undefined,
      overlayText: monthPage.overlayText ?? undefined,
    });

    // Process and embed images at print quality
    await embedPrintImages(pdfDoc, pdfPage, monthCommands, dims, scale);

    // Draw non-image commands
    drawCommandsToPdf(pdfPage, monthCommands, dims, fonts, scale);

    // Add crop marks
    addCropMarks(pdfPage, dims, bleedPx, scale);
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

async function embedPrintImages(
  pdfDoc: PDFDocument,
  pdfPage: ReturnType<PDFDocument["addPage"]>,
  commands: DrawCommand[],
  dims: { height: number },
  scale: number = 1
): Promise<void> {
  const pageHeightPt = dims.height * scale;

  for (const cmd of commands) {
    if (cmd.type !== "image") continue;

    try {
      const imageBuffer = await fetchImageBuffer(cmd.imageUrl);
      const processed = await processImageForPrint(
        imageBuffer,
        cmd.width,
        cmd.height
      );

      const embeddedImage = await pdfDoc.embedJpg(processed.bytes);

      pdfPage.drawImage(embeddedImage, {
        x: cmd.x * scale,
        y: pageHeightPt - (cmd.y + cmd.height) * scale,
        width: cmd.width * scale,
        height: cmd.height * scale,
      });
    } catch {
      // If image processing fails, draw a placeholder
      pdfPage.drawRectangle({
        x: cmd.x * scale,
        y: pageHeightPt - (cmd.y + cmd.height) * scale,
        width: cmd.width * scale,
        height: cmd.height * scale,
        color: rgb(0.9, 0.9, 0.9),
        borderColor: rgb(0.7, 0.7, 0.7),
        borderWidth: 1,
      });
    }
  }
}
