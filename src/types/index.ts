// ============================================================================
// API Envelope
// ============================================================================

export type ApiResponse<T = undefined> = {
  success: boolean;
  data?: T;
  error?: string;
};

// ============================================================================
// Tiers
// ============================================================================

export type Tier = "trial" | "hobby" | "pro" | "free";

// ============================================================================
// User Profile
// ============================================================================

export type UserProfile = {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  tier: Tier;
  trialEndsAt: Date | null;
  monthlyCalendarsCreated: number;
  monthlyExportsUsed: number;
  totalCalendarsCreated: number;
  totalExportsUsed: number;
  monthlyCounterResetAt: Date | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: Date | null;
  stripeCancelAtPeriodEnd: boolean;
  emailUnsubscribed: boolean;
  lastActiveAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// ============================================================================
// Calendar Project
// ============================================================================

export type CoverLayout = {
  position?: { x: number; y: number };
  zoom?: number;
  overlayText?: string;
};

export type CalendarProject = {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: "draft" | "completed" | "ordered";
  templateId: string | null;
  calendarYear: number;
  startMonth: number;
  coverImageKey: string | null;
  coverImageUrl: string | null;
  coverLayout: CoverLayout | null;
  orientation: "portrait" | "landscape";
  paperSize: "A4" | "A5";
  locale: string;
  shareId: string | null;
  lastExportedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CalendarProjectWithPages = CalendarProject & {
  pages: CalendarPage[];
};

// ============================================================================
// Calendar Page
// ============================================================================

export type ImagePosition = {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
};

export type TextStyle = {
  font: string;
  size: number;
  color: string;
  position: { x: number; y: number };
};

export type CalendarPage = {
  id: string;
  projectId: string;
  userId: string;
  monthIndex: number;
  imageKey: string | null;
  imageUrl: string | null;
  imagePosition: ImagePosition | null;
  imageCropData: Record<string, unknown> | null;
  overlayText: string | null;
  textStyle: TextStyle | null;
  backgroundColor: string | null;
  layoutVariant: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

// ============================================================================
// Template
// ============================================================================

export type LayoutRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TemplateConfig = {
  orientation: "portrait" | "landscape";
  supportedSizes: ("A4" | "A5")[];
  coverLayout: {
    imageArea: LayoutRect;
    titleArea: LayoutRect;
    yearArea: LayoutRect;
  };
  monthLayout: {
    imageArea: LayoutRect;
    calendarGridArea: LayoutRect;
    monthTitleArea: LayoutRect;
  };
  typography: {
    monthTitleFont: string;
    monthTitleSize: number;
    dayFont: string;
    daySize: number;
    yearFont: string;
    yearSize: number;
  };
  colors: {
    background: string;
    text: string;
    accent: string;
    gridLines: string;
    weekendHighlight: string;
  };
  grid: {
    showWeekNumbers: boolean;
    firstDayOfWeek: number;
    dayHeaderFormat: "narrow" | "short" | "long";
  };
  bleed: number;
  dpi: number;
};

export type CalendarTemplate = {
  id: string;
  name: string;
  description: string | null;
  category: "minimal" | "classic" | "modern" | "artistic" | "seasonal";
  thumbnailUrl: string | null;
  previewImages: string[] | null;
  config: TemplateConfig;
  isPremium: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
};

// ============================================================================
// Print Order
// ============================================================================

export type ShippingAddress = {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postcode: string;
  country: string;
};

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "generating_pdf"
  | "submitted"
  | "in_production"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "failed";

export type PrintOrder = {
  id: string;
  userId: string;
  projectId: string;
  provider: string;
  providerOrderId: string | null;
  providerStatus: string | null;
  quantity: number;
  shippingName: string | null;
  shippingAddress: ShippingAddress | null;
  shippingMethod: "standard" | "express";
  productSku: string | null;
  paperSize: string | null;
  wholesalePriceCents: number | null;
  wholesaleCurrency: string | null;
  retailPriceCents: number | null;
  retailCurrency: string | null;
  stripePaymentIntentId: string | null;
  stripePaymentStatus: string | null;
  pdfUrl: string | null;
  pdfGeneratedAt: Date | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  status: OrderStatus;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// ============================================================================
// Image Upload
// ============================================================================

export type ImageUpload = {
  id: string;
  userId: string;
  projectId: string | null;
  r2Key: string;
  originalFilename: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  width: number | null;
  height: number | null;
  expiresAt: Date | null; // null = assigned to a page (persists forever)
  isActive: boolean;
  createdAt: Date;
};

// ============================================================================
// Feedback
// ============================================================================

export type FeedbackItem = {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: "feature" | "bug" | "improvement";
  status: "open" | "planned" | "in_progress" | "done" | "closed";
  voteCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// ============================================================================
// Pagination
// ============================================================================

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};
