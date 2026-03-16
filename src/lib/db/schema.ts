import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
  jsonb,
  uniqueIndex,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";

// ============================================================================
// Profiles
// ============================================================================

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull().unique(),
    email: text("email").notNull(),
    name: text("name"),
    avatarUrl: text("avatar_url"),

    // Tier
    tier: text("tier").notNull().default("trial"), // trial | hobby | pro | free
    trialEndsAt: timestamp("trial_ends_at"),

    // Usage counters
    monthlyCalendarsCreated: integer("monthly_calendars_created")
      .notNull()
      .default(0),
    monthlyExportsUsed: integer("monthly_exports_used").notNull().default(0),
    totalCalendarsCreated: integer("total_calendars_created")
      .notNull()
      .default(0),
    totalExportsUsed: integer("total_exports_used").notNull().default(0),
    monthlyCounterResetAt: timestamp("monthly_counter_reset_at"),

    // Stripe
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    stripePriceId: text("stripe_price_id"),
    stripeCurrentPeriodEnd: timestamp("stripe_current_period_end"),
    stripeCancelAtPeriodEnd: boolean("stripe_cancel_at_period_end")
      .notNull()
      .default(false),

    // Email tracking
    emailUnsubscribed: boolean("email_unsubscribed").notNull().default(false),
    welcomeEmailSentAt: timestamp("welcome_email_sent_at"),
    trialDay3EmailSentAt: timestamp("trial_day3_email_sent_at"),
    trialDay6EmailSentAt: timestamp("trial_day6_email_sent_at"),
    trialExpiredEmailSentAt: timestamp("trial_expired_email_sent_at"),

    // Engagement
    lastActiveAt: timestamp("last_active_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("profiles_user_id_idx").on(table.userId),
    index("profiles_email_idx").on(table.email),
    index("profiles_tier_idx").on(table.tier),
  ]
);

// ============================================================================
// Calendar Projects
// ============================================================================

export const calendarProjects = pgTable(
  "calendar_projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    title: text("title").notNull().default("Untitled Calendar"),
    description: text("description"),

    status: text("status").notNull().default("draft"), // draft | completed | ordered
    templateId: text("template_id"),

    calendarYear: integer("calendar_year").notNull(),
    startMonth: integer("start_month").notNull().default(1), // 1-12
    coverImageKey: text("cover_image_key"),
    coverImageUrl: text("cover_image_url"),
    coverLayout: jsonb("cover_layout"), // { position, zoom, overlayText }

    orientation: text("orientation").notNull().default("portrait"), // portrait | landscape
    paperSize: text("paper_size").notNull().default("A4"), // A4 | A5
    locale: text("locale").notNull().default("en-GB"),

    shareId: text("share_id").unique(),
    lastExportedAt: timestamp("last_exported_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("calendar_projects_user_id_idx").on(table.userId),
    index("calendar_projects_status_idx").on(table.status),
    uniqueIndex("calendar_projects_share_id_idx").on(table.shareId),
  ]
);

// ============================================================================
// Calendar Pages
// ============================================================================

export const calendarPages = pgTable(
  "calendar_pages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => calendarProjects.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),

    monthIndex: integer("month_index").notNull(), // 0=cover, 1-12=months

    imageKey: text("image_key"),
    imageUrl: text("image_url"),
    imagePosition: jsonb("image_position"), // { x, y, zoom, rotation }
    imageCropData: jsonb("image_crop_data"),

    overlayText: text("overlay_text"),
    textStyle: jsonb("text_style"), // { font, size, color, position }

    backgroundColor: text("background_color"),
    layoutVariant: text("layout_variant"),

    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("calendar_pages_project_month_idx").on(
      table.projectId,
      table.monthIndex
    ),
    index("calendar_pages_user_id_idx").on(table.userId),
    index("calendar_pages_project_id_idx").on(table.projectId),
  ]
);

// ============================================================================
// Calendar Templates
// ============================================================================

export const calendarTemplates = pgTable(
  "calendar_templates",
  {
    id: text("id").primaryKey(), // slug e.g. 'classic-white'
    name: text("name").notNull(),
    description: text("description"),
    category: text("category").notNull(), // minimal | classic | modern | artistic | seasonal

    thumbnailUrl: text("thumbnail_url"),
    previewImages: jsonb("preview_images"), // string[]

    config: jsonb("config").notNull(), // TemplateConfig
    isPremium: boolean("is_premium").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),

    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("calendar_templates_category_idx").on(table.category),
    index("calendar_templates_active_idx").on(table.isActive),
  ]
);

// ============================================================================
// Print Orders
// ============================================================================

export const printOrders = pgTable(
  "print_orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => calendarProjects.id),

    provider: text("provider").notNull().default("prodigi"),
    providerOrderId: text("provider_order_id"),
    providerStatus: text("provider_status"),

    quantity: integer("quantity").notNull().default(1),
    shippingName: text("shipping_name"),
    shippingAddress: jsonb("shipping_address"), // { line1, line2, city, state, postcode, country }
    shippingMethod: text("shipping_method").notNull().default("standard"), // standard | express

    productSku: text("product_sku"),
    paperSize: text("paper_size"),

    wholesalePriceCents: integer("wholesale_price_cents"),
    wholesaleCurrency: text("wholesale_currency").default("GBP"),
    retailPriceCents: integer("retail_price_cents"),
    retailCurrency: text("retail_currency").default("GBP"),

    stripePaymentIntentId: text("stripe_payment_intent_id"),
    stripePaymentStatus: text("stripe_payment_status"),

    pdfUrl: text("pdf_url"),
    pdfGeneratedAt: timestamp("pdf_generated_at"),

    trackingNumber: text("tracking_number"),
    trackingUrl: text("tracking_url"),

    status: text("status").notNull().default("pending_payment"),
    // pending_payment | paid | generating_pdf | submitted | in_production | shipped | delivered | cancelled | failed

    errorMessage: text("error_message"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("print_orders_user_id_idx").on(table.userId),
    index("print_orders_project_id_idx").on(table.projectId),
    index("print_orders_status_idx").on(table.status),
    index("print_orders_provider_order_id_idx").on(table.providerOrderId),
  ]
);

// ============================================================================
// Image Uploads
// ============================================================================

export const imageUploads = pgTable(
  "image_uploads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    projectId: uuid("project_id").references(() => calendarProjects.id, {
      onDelete: "cascade",
    }),

    r2Key: text("r2_key").notNull().unique(),
    originalFilename: text("original_filename"),
    mimeType: text("mime_type"),
    sizeBytes: integer("size_bytes"),
    width: integer("width"),
    height: integer("height"),

    expiresAt: timestamp("expires_at"), // null = assigned to a page (persists forever)
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("image_uploads_user_id_idx").on(table.userId),
    index("image_uploads_project_id_idx").on(table.projectId),
    uniqueIndex("image_uploads_r2_key_idx").on(table.r2Key),
    index("image_uploads_expires_at_idx").on(table.expiresAt),
  ]
);

// ============================================================================
// Webhook Events (idempotency)
// ============================================================================

export const webhookEvents = pgTable("webhook_events", {
  id: text("id").primaryKey(), // event ID from provider
  provider: text("provider").notNull(), // stripe | prodigi
  eventType: text("event_type").notNull(),
  processedAt: timestamp("processed_at").defaultNow().notNull(),
});

// ============================================================================
// Feedback
// ============================================================================

export const feedback = pgTable(
  "feedback",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull().default("feature"), // feature | bug | improvement
    status: text("status").notNull().default("open"), // open | planned | in_progress | done | closed
    voteCount: integer("vote_count").notNull().default(0),
    isDeleted: boolean("is_deleted").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("feedback_user_id_idx").on(table.userId),
    index("feedback_status_idx").on(table.status),
  ]
);

export const feedbackVotes = pgTable(
  "feedback_votes",
  {
    feedbackId: uuid("feedback_id")
      .notNull()
      .references(() => feedback.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.feedbackId, table.userId] }),
    index("feedback_votes_user_id_idx").on(table.userId),
  ]
);

// ============================================================================
// Exit Surveys
// ============================================================================

export const exitSurveys = pgTable("exit_surveys", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id"),
  reason: text("reason").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// Deleted Emails (trial re-abuse prevention)
// ============================================================================

export const deletedEmails = pgTable("deleted_emails", {
  id: uuid("id").defaultRandom().primaryKey(),
  emailHash: text("email_hash").notNull().unique(),
  deletedAt: timestamp("deleted_at").defaultNow().notNull(),
});
