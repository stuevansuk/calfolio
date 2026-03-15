import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { fetchProfile, insertDeletedEmail } from "@/lib/db/api";
import { stripe } from "@/lib/stripe/config";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";
import { createHash } from "crypto";

const deleteSchema = z.object({
  confirmEmail: z.string().email(),
});

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const rl = checkRateLimit(session.user.id, "accountDeletion");
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid input" },
      { status: 400 }
    );
  }

  if (parsed.data.confirmEmail !== session.user.email) {
    return NextResponse.json(
      { success: false, error: "Email does not match" },
      { status: 400 }
    );
  }

  const profile = await fetchProfile(session.user.id);

  // Cancel Stripe subscription if active
  if (profile?.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.cancel(profile.stripeSubscriptionId);
    } catch (err) {
      console.error("Failed to cancel subscription:", err);
    }
  }

  // Hash email for re-abuse prevention
  const emailHash = createHash("sha256")
    .update(session.user.email.toLowerCase())
    .digest("hex");
  await insertDeletedEmail(emailHash);

  // Delete profile
  await db.delete(profiles).where(eq(profiles.userId, session.user.id));

  return NextResponse.json({ success: true });
}
