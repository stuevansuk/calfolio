import { PDFDocument, StandardFonts } from "pdf-lib";
import type { CalendarProject, CalendarPage, TemplateConfig } from "@/types";
import {
  getPageDimensions,
  generateCoverCommands,
  generateMonthPageCommands,
} from "@/lib/calendar/layout";
import type { DrawCommand } from "@/lib/calendar/layout";
import { generateMonthGrid } from "@/lib/calendar/grid";
import { drawCommandsToPdf, addWatermark } from "@/lib/pdf/pdf-drawer";

const PREVIEW_DPI = 72;
const PREVIEW_BLEED_MM = 0;

type PreviewOptions = {
  addWatermark: boolean;
};

async function fetchImageBytes(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${url}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

function detectImageType(
  url: string,
  bytes: Uint8Array
): "jpg" | "png" {
  // Check magic bytes first
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e) {
    return "png";
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    return "jpg";
  }
  // Fall back to URL extension
  const lower = url.toLowerCase();
  if (lower.includes(".png")) return "png";
  return "jpg";
}

export async function generatePreviewPdf(
  project: CalendarProject,
  pages: CalendarPage[],
  templateConfig: TemplateConfig,
  options: PreviewOptions
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

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

  const dims = getPageDimensions(
    project.paperSize,
    project.orientation,
    PREVIEW_DPI,
    PREVIEW_BLEED_MM
  );

  // Sort pages by sortOrder
  const sortedPages = [...pages].sort((a, b) => a.sortOrder - b.sortOrder);

  // Find cover page (monthIndex === 0)
  const coverPage = sortedPages.find((p) => p.monthIndex === 0);
  const monthPages = sortedPages.filter((p) => p.monthIndex > 0);

  // Generate cover page
  if (coverPage) {
    const pdfPage = pdfDoc.addPage([dims.width, dims.height]);
    const coverCommands = generateCoverCommands(templateConfig, dims, {
      title: project.title,
      year: project.calendarYear,
      imageUrl: coverPage.imageUrl ?? undefined,
      cropData: coverPage.imageCropData ?? undefined,
    });

    // Embed and draw images from commands
    await embedAndDrawImages(pdfDoc, pdfPage, coverCommands, dims);

    // Draw non-image commands
    drawCommandsToPdf(pdfPage, coverCommands, dims, fonts);

    if (options.addWatermark) {
      addWatermark(pdfPage, dims, helvetica);
    }
  }

  // Generate month pages
  for (const monthPage of monthPages) {
    const pdfPage = pdfDoc.addPage([dims.width, dims.height]);

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

    // Embed and draw images from commands
    await embedAndDrawImages(pdfDoc, pdfPage, monthCommands, dims);

    // Draw non-image commands
    drawCommandsToPdf(pdfPage, monthCommands, dims, fonts);

    if (options.addWatermark) {
      addWatermark(pdfPage, dims, helvetica);
    }
  }

  return pdfDoc.save();
}

async function embedAndDrawImages(
  pdfDoc: PDFDocument,
  pdfPage: ReturnType<PDFDocument["addPage"]>,
  commands: DrawCommand[],
  dims: { height: number }
): Promise<void> {
  for (const cmd of commands) {
    if (cmd.type !== "image") continue;

    try {
      const imageBytes = await fetchImageBytes(cmd.imageUrl);
      const imageType = detectImageType(cmd.imageUrl, imageBytes);

      const embeddedImage =
        imageType === "png"
          ? await pdfDoc.embedPng(imageBytes)
          : await pdfDoc.embedJpg(imageBytes);

      pdfPage.drawImage(embeddedImage, {
        x: cmd.x,
        y: dims.height - cmd.y - cmd.height,
        width: cmd.width,
        height: cmd.height,
      });
    } catch {
      // If image fails to load, draw a placeholder rectangle
      const { rgb } = await import("pdf-lib");
      pdfPage.drawRectangle({
        x: cmd.x,
        y: dims.height - cmd.y - cmd.height,
        width: cmd.width,
        height: cmd.height,
        color: rgb(0.9, 0.9, 0.9),
        borderColor: rgb(0.7, 0.7, 0.7),
        borderWidth: 1,
      });
    }
  }
}
