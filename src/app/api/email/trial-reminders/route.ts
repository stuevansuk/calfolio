import { NextRequest, NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";
import { updateProfileAdmin } from "@/lib/db/api";
import { sendEmail } from "@/lib/email/send";
import {
  trialDay3Email,
  trialDay6Email,
  trialExpiredEmail,
} from "@/lib/email/templates";
import { generateUnsubscribeUrl } from "@/lib/email/unsubscribe";

const BUDGET_CAP = 25;
const SEND_DELAY_MS = 750;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function daysBetween(from: Date, to: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((to.getTime() - from.getTime()) / msPerDay);
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
  const now = new Date();
  let sent = 0;

  // Fetch all trial users who haven't unsubscribed and have a trialEndsAt set
  const eligibleProfiles = await db
    .select()
    .from(profiles)
    .where(
      and(
        eq(profiles.tier, "trial"),
        eq(profiles.emailUnsubscribed, false),
        isNotNull(profiles.trialEndsAt)
      )
    );

  for (const profile of eligibleProfiles) {
    if (sent >= BUDGET_CAP) break;

    const trialEndsAt = profile.trialEndsAt!;
    const daysLeft = daysBetween(now, trialEndsAt);
    const unsubscribeUrl = generateUnsubscribeUrl(profile.userId, appUrl);
    const name = profile.name || profile.email;

    let emailSent = false;

    // Trial expired (daysLeft <= 0)
    if (daysLeft <= 0 && !profile.trialExpiredEmailSentAt) {
      const result = await sendEmail({
        to: profile.email,
        subject: "Your Calfolio trial has ended",
        html: trialExpiredEmail(name, appUrl, unsubscribeUrl),
      });
      if (result.success) {
        await updateProfileAdmin(profile.userId, {
          trialExpiredEmailSentAt: new Date(),
        });
        emailSent = true;
      }
    }
    // Day 6 — 1 day left (daysLeft === 1)
    else if (daysLeft <= 1 && !profile.trialDay6EmailSentAt) {
      const result = await sendEmail({
        to: profile.email,
        subject: "Your Calfolio trial expires tomorrow",
        html: trialDay6Email(name, appUrl, unsubscribeUrl),
      });
      if (result.success) {
        await updateProfileAdmin(profile.userId, {
          trialDay6EmailSentAt: new Date(),
        });
        emailSent = true;
      }
    }
    // Day 3 — ~4 days left (daysLeft <= 4)
    else if (daysLeft <= 4 && !profile.trialDay3EmailSentAt) {
      const result = await sendEmail({
        to: profile.email,
        subject: `${daysLeft} days left on your Calfolio trial`,
        html: trialDay3Email(name, daysLeft, appUrl, unsubscribeUrl),
      });
      if (result.success) {
        await updateProfileAdmin(profile.userId, {
          trialDay3EmailSentAt: new Date(),
        });
        emailSent = true;
      }
    }

    if (emailSent) {
      sent++;
      if (sent < BUDGET_CAP) {
        await delay(SEND_DELAY_MS);
      }
    }
  }

  return NextResponse.json({
    success: true,
    data: { sent },
  });
}
