import { NextRequest, NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq, isNull, and } from "drizzle-orm";
import { updateProfileAdmin, fetchProfile } from "@/lib/db/api";
import { sendEmail } from "@/lib/email/send";
import { welcomeEmail } from "@/lib/email/templates";

const BUDGET_CAP = 25;
const SEND_DELAY_MS = 750;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !isAdmin(session.user.email)) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  let sent = 0;
  const errors: string[] = [];

  // Check for optional body with userId for single-user send
  let targetUserId: string | null = null;
  try {
    const body = await request.json();
    if (body && typeof body.userId === "string") {
      targetUserId = body.userId;
    }
  } catch {
    // No body or invalid JSON — send to all eligible
  }

  if (targetUserId) {
    // Single user send
    const profile = await fetchProfile(targetUserId);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    if (profile.welcomeEmailSentAt) {
      return NextResponse.json({
        success: true,
        data: { sent: 0, message: "Welcome email already sent" },
      });
    }

    const result = await sendEmail({
      to: profile.email,
      subject: "Welcome to Calfolio!",
      html: welcomeEmail(profile.name || profile.email, appUrl),
    });

    if (result.success) {
      await updateProfileAdmin(targetUserId, {
        welcomeEmailSentAt: new Date(),
      });
      sent = 1;
    } else {
      errors.push(profile.email);
    }
  } else {
    // Bulk send to all users without welcome email
    const eligibleProfiles = await db
      .select()
      .from(profiles)
      .where(
        and(
          isNull(profiles.welcomeEmailSentAt),
          eq(profiles.emailUnsubscribed, false)
        )
      )
      .limit(BUDGET_CAP);

    for (const profile of eligibleProfiles) {
      if (sent >= BUDGET_CAP) break;

      const result = await sendEmail({
        to: profile.email,
        subject: "Welcome to Calfolio!",
        html: welcomeEmail(profile.name || profile.email, appUrl),
      });

      if (result.success) {
        await updateProfileAdmin(profile.userId, {
          welcomeEmailSentAt: new Date(),
        });
        sent++;
      } else {
        errors.push(profile.email);
      }

      if (sent < eligibleProfiles.length) {
        await delay(SEND_DELAY_MS);
      }
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      sent,
      ...(errors.length > 0 ? { failedCount: errors.length } : {}),
    },
  });
}
