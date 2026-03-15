export const TIER_NAMES = {
  trial: "Trial",
  hobby: "Hobby",
  pro: "Pro",
  free: "Free",
} as const;

export const TRIAL_DURATION_DAYS = 7;

export const PAGINATION = {
  defaultLimit: 50,
  maxLimit: 200,
  maxAll: 10000,
} as const;

export const BATCH_SIZES = {
  imageUpload: 10,
  pageUpdate: 13,
  sync: 100,
} as const;

export const SYNC_STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export const IMAGE_CONSTRAINTS = {
  maxFileSizeMB: 4,
  maxDimensionPx: 4096,
  compressionQuality: 0.85,
  presignExpirySeconds: 900, // 15 min
  r2ExpiryHours: 48,
  printPdfExpiryDays: 30,
} as const;

export const CALENDAR = {
  pagesPerProject: 13, // cover + 12 months
  coverMonthIndex: 0,
} as const;

export const PRINT_PRICING = {
  handlingFeeCents: 150, // £1.50
  markupPercent: 50, // 50% on wholesale
} as const;
