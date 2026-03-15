import { eq, and, desc, asc, count, sql, isNull } from "drizzle-orm";
import { db } from "./index";
import {
  profiles,
  calendarProjects,
  calendarPages,
  calendarTemplates,
  printOrders,
  imageUploads,
  webhookEvents,
  feedback,
  feedbackVotes,
  exitSurveys,
  deletedEmails,
} from "./schema";

// ============================================================================
// Profiles
// ============================================================================

export async function fetchProfile(userId: string) {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  return profile ?? null;
}

export async function fetchProfileByEmail(email: string) {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.email, email))
    .limit(1);
  return profile ?? null;
}

const SAFE_PROFILE_FIELDS = [
  "name",
  "avatarUrl",
  "emailUnsubscribed",
] as const;

export async function updateProfile(
  userId: string,
  data: Partial<Pick<typeof profiles.$inferInsert, (typeof SAFE_PROFILE_FIELDS)[number]>>
) {
  const safeData: Record<string, unknown> = {};
  for (const key of SAFE_PROFILE_FIELDS) {
    if (key in data) {
      safeData[key] = data[key as keyof typeof data];
    }
  }
  safeData.updatedAt = new Date();

  const [updated] = await db
    .update(profiles)
    .set(safeData)
    .where(eq(profiles.userId, userId))
    .returning();
  return updated ?? null;
}

export async function updateProfileAdmin(
  userId: string,
  data: Partial<typeof profiles.$inferInsert>
) {
  const [updated] = await db
    .update(profiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(profiles.userId, userId))
    .returning();
  return updated ?? null;
}

// ============================================================================
// Calendar Projects
// ============================================================================

export async function fetchCalendarProjects(
  userId: string,
  options: { limit?: number; offset?: number; status?: string } = {}
) {
  const { limit = 50, offset = 0, status } = options;
  const conditions = [eq(calendarProjects.userId, userId)];
  if (status) {
    conditions.push(eq(calendarProjects.status, status));
  }

  const items = await db
    .select()
    .from(calendarProjects)
    .where(and(...conditions))
    .orderBy(desc(calendarProjects.updatedAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(calendarProjects)
    .where(and(...conditions));

  return { items, total, limit, offset };
}

export async function fetchCalendarProject(id: string, userId: string) {
  const [project] = await db
    .select()
    .from(calendarProjects)
    .where(and(eq(calendarProjects.id, id), eq(calendarProjects.userId, userId)))
    .limit(1);
  return project ?? null;
}

export async function fetchCalendarProjectWithPages(id: string, userId: string) {
  const project = await fetchCalendarProject(id, userId);
  if (!project) return null;

  const pages = await db
    .select()
    .from(calendarPages)
    .where(
      and(eq(calendarPages.projectId, id), eq(calendarPages.userId, userId))
    )
    .orderBy(asc(calendarPages.monthIndex));

  return { ...project, pages };
}

export async function fetchCalendarProjectByShareId(shareId: string) {
  const [project] = await db
    .select()
    .from(calendarProjects)
    .where(eq(calendarProjects.shareId, shareId))
    .limit(1);
  if (!project) return null;

  const pages = await db
    .select()
    .from(calendarPages)
    .where(eq(calendarPages.projectId, project.id))
    .orderBy(asc(calendarPages.monthIndex));

  return { ...project, pages };
}

export async function insertCalendarProject(
  data: typeof calendarProjects.$inferInsert
) {
  const [project] = await db
    .insert(calendarProjects)
    .values(data)
    .returning();
  return project;
}

export async function updateCalendarProject(
  id: string,
  userId: string,
  data: Partial<typeof calendarProjects.$inferInsert>
) {
  const [updated] = await db
    .update(calendarProjects)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(eq(calendarProjects.id, id), eq(calendarProjects.userId, userId))
    )
    .returning();
  return updated ?? null;
}

export async function deleteCalendarProject(id: string, userId: string) {
  const [deleted] = await db
    .delete(calendarProjects)
    .where(
      and(eq(calendarProjects.id, id), eq(calendarProjects.userId, userId))
    )
    .returning();
  return deleted ?? null;
}

export async function countCalendarProjects(userId: string) {
  const [{ total }] = await db
    .select({ total: count() })
    .from(calendarProjects)
    .where(eq(calendarProjects.userId, userId));
  return total;
}

// ============================================================================
// Calendar Pages
// ============================================================================

export async function fetchCalendarPages(projectId: string, userId: string) {
  return db
    .select()
    .from(calendarPages)
    .where(
      and(
        eq(calendarPages.projectId, projectId),
        eq(calendarPages.userId, userId)
      )
    )
    .orderBy(asc(calendarPages.monthIndex));
}

export async function insertCalendarPages(
  pages: (typeof calendarPages.$inferInsert)[]
) {
  return db.insert(calendarPages).values(pages).returning();
}

export async function updateCalendarPage(
  id: string,
  userId: string,
  data: Partial<typeof calendarPages.$inferInsert>
) {
  const [updated] = await db
    .update(calendarPages)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(eq(calendarPages.id, id), eq(calendarPages.userId, userId))
    )
    .returning();
  return updated ?? null;
}

export async function bulkUpdateCalendarPages(
  userId: string,
  updates: { id: string; data: Partial<typeof calendarPages.$inferInsert> }[]
) {
  const results = [];
  for (const update of updates) {
    const result = await updateCalendarPage(update.id, userId, update.data);
    if (result) results.push(result);
  }
  return results;
}

// ============================================================================
// Calendar Templates
// ============================================================================

export async function fetchTemplates(options: { category?: string } = {}) {
  const conditions = [eq(calendarTemplates.isActive, true)];
  if (options.category) {
    conditions.push(eq(calendarTemplates.category, options.category));
  }

  return db
    .select()
    .from(calendarTemplates)
    .where(and(...conditions))
    .orderBy(asc(calendarTemplates.sortOrder));
}

export async function fetchTemplate(id: string) {
  const [template] = await db
    .select()
    .from(calendarTemplates)
    .where(eq(calendarTemplates.id, id))
    .limit(1);
  return template ?? null;
}

// ============================================================================
// Print Orders
// ============================================================================

export async function fetchPrintOrders(
  userId: string,
  options: { limit?: number; offset?: number } = {}
) {
  const { limit = 50, offset = 0 } = options;

  const items = await db
    .select()
    .from(printOrders)
    .where(eq(printOrders.userId, userId))
    .orderBy(desc(printOrders.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(printOrders)
    .where(eq(printOrders.userId, userId));

  return { items, total, limit, offset };
}

export async function fetchPrintOrder(id: string, userId: string) {
  const [order] = await db
    .select()
    .from(printOrders)
    .where(and(eq(printOrders.id, id), eq(printOrders.userId, userId)))
    .limit(1);
  return order ?? null;
}

export async function fetchPrintOrderByPaymentIntent(paymentIntentId: string) {
  const [order] = await db
    .select()
    .from(printOrders)
    .where(eq(printOrders.stripePaymentIntentId, paymentIntentId))
    .limit(1);
  return order ?? null;
}

export async function insertPrintOrder(
  data: typeof printOrders.$inferInsert
) {
  const [order] = await db.insert(printOrders).values(data).returning();
  return order;
}

export async function updatePrintOrder(
  id: string,
  userId: string,
  data: Partial<typeof printOrders.$inferInsert>
) {
  const [updated] = await db
    .update(printOrders)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(printOrders.id, id), eq(printOrders.userId, userId)))
    .returning();
  return updated ?? null;
}

export async function updatePrintOrderAdmin(
  id: string,
  data: Partial<typeof printOrders.$inferInsert>
) {
  const [updated] = await db
    .update(printOrders)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(printOrders.id, id))
    .returning();
  return updated ?? null;
}

// ============================================================================
// Image Uploads
// ============================================================================

export async function fetchImageUploads(userId: string, projectId?: string) {
  const conditions = [
    eq(imageUploads.userId, userId),
    eq(imageUploads.isActive, true),
  ];
  if (projectId) {
    conditions.push(eq(imageUploads.projectId, projectId));
  }

  return db
    .select()
    .from(imageUploads)
    .where(and(...conditions))
    .orderBy(desc(imageUploads.createdAt));
}

export async function fetchImageUploadByKey(r2Key: string, userId: string) {
  const [upload] = await db
    .select()
    .from(imageUploads)
    .where(
      and(eq(imageUploads.r2Key, r2Key), eq(imageUploads.userId, userId))
    )
    .limit(1);
  return upload ?? null;
}

export async function countImageUploads(userId: string) {
  const [{ total }] = await db
    .select({ total: count() })
    .from(imageUploads)
    .where(
      and(eq(imageUploads.userId, userId), eq(imageUploads.isActive, true))
    );
  return total;
}

export async function insertImageUpload(
  data: typeof imageUploads.$inferInsert
) {
  const [upload] = await db.insert(imageUploads).values(data).returning();
  return upload;
}

export async function deleteImageUpload(r2Key: string, userId: string) {
  const [deleted] = await db
    .update(imageUploads)
    .set({ isActive: false })
    .where(
      and(eq(imageUploads.r2Key, r2Key), eq(imageUploads.userId, userId))
    )
    .returning();
  return deleted ?? null;
}

// ============================================================================
// Webhook Events (idempotency)
// ============================================================================

export async function checkWebhookProcessed(eventId: string) {
  const [event] = await db
    .select()
    .from(webhookEvents)
    .where(eq(webhookEvents.id, eventId))
    .limit(1);
  return !!event;
}

export async function insertWebhookEvent(
  id: string,
  provider: string,
  eventType: string
) {
  await db.insert(webhookEvents).values({ id, provider, eventType });
}

// ============================================================================
// Feedback
// ============================================================================

export async function fetchFeedbackList(options: {
  userId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const { userId, status, limit = 50, offset = 0 } = options;
  const conditions = [eq(feedback.isDeleted, false)];
  if (userId) conditions.push(eq(feedback.userId, userId));
  if (status) conditions.push(eq(feedback.status, status));

  const items = await db
    .select()
    .from(feedback)
    .where(and(...conditions))
    .orderBy(desc(feedback.voteCount), desc(feedback.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(feedback)
    .where(and(...conditions));

  return { items, total, limit, offset };
}

export async function fetchFeedbackItem(id: string) {
  const [item] = await db
    .select()
    .from(feedback)
    .where(and(eq(feedback.id, id), eq(feedback.isDeleted, false)))
    .limit(1);
  return item ?? null;
}

export async function insertFeedback(data: typeof feedback.$inferInsert) {
  const [item] = await db.insert(feedback).values(data).returning();
  return item;
}

export async function updateFeedback(
  id: string,
  data: Partial<typeof feedback.$inferInsert>
) {
  const [updated] = await db
    .update(feedback)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(feedback.id, id))
    .returning();
  return updated ?? null;
}

export async function insertFeedbackVote(feedbackId: string, userId: string) {
  await db.insert(feedbackVotes).values({ feedbackId, userId });
  await db
    .update(feedback)
    .set({ voteCount: sql`${feedback.voteCount} + 1` })
    .where(eq(feedback.id, feedbackId));
}

export async function deleteFeedbackVote(feedbackId: string, userId: string) {
  await db
    .delete(feedbackVotes)
    .where(
      and(
        eq(feedbackVotes.feedbackId, feedbackId),
        eq(feedbackVotes.userId, userId)
      )
    );
  await db
    .update(feedback)
    .set({ voteCount: sql`GREATEST(${feedback.voteCount} - 1, 0)` })
    .where(eq(feedback.id, feedbackId));
}

export async function checkFeedbackVote(feedbackId: string, userId: string) {
  const [vote] = await db
    .select()
    .from(feedbackVotes)
    .where(
      and(
        eq(feedbackVotes.feedbackId, feedbackId),
        eq(feedbackVotes.userId, userId)
      )
    )
    .limit(1);
  return !!vote;
}

// ============================================================================
// Exit Surveys
// ============================================================================

export async function insertExitSurvey(
  data: typeof exitSurveys.$inferInsert
) {
  const [survey] = await db.insert(exitSurveys).values(data).returning();
  return survey;
}

// ============================================================================
// Deleted Emails
// ============================================================================

export async function checkDeletedEmail(emailHash: string) {
  const [existing] = await db
    .select()
    .from(deletedEmails)
    .where(eq(deletedEmails.emailHash, emailHash))
    .limit(1);
  return !!existing;
}

export async function insertDeletedEmail(emailHash: string) {
  await db.insert(deletedEmails).values({ emailHash });
}
