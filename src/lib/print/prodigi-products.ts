export type PaperSize = "A4" | "A5";
export type CalendarType = "dated" | "undated";

type ProdigiProduct = {
  sku: string;
  paperSize: PaperSize;
  calendarType: CalendarType;
  description: string;
};

export const PRODIGI_PRODUCTS: ProdigiProduct[] = [
  {
    sku: "CALENDAR-A4-L-DATED",
    paperSize: "A4",
    calendarType: "dated",
    description: "A4 Landscape Dated Wall Calendar",
  },
  {
    sku: "CALENDAR-A4-L-UNDATED",
    paperSize: "A4",
    calendarType: "undated",
    description: "A4 Landscape Undated Wall Calendar",
  },
  {
    sku: "CALENDAR-A5-L-DATED",
    paperSize: "A5",
    calendarType: "dated",
    description: "A5 Landscape Dated Wall Calendar",
  },
  {
    sku: "CALENDAR-A5-L-UNDATED",
    paperSize: "A5",
    calendarType: "undated",
    description: "A5 Landscape Undated Wall Calendar",
  },
];

export function getProductSku(
  paperSize: PaperSize,
  calendarType: CalendarType = "dated"
): string | null {
  const product = PRODIGI_PRODUCTS.find(
    (p) => p.paperSize === paperSize && p.calendarType === calendarType
  );
  return product?.sku ?? null;
}
