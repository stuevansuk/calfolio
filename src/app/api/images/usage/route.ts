import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { countImageUploads, fetchProfile } from "@/lib/db/api";
import { getEffectiveTier, TIER_LIMITS } from "@/lib/tier-check";
import type { Tier } from "@/types";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const rl = checkRateLimit(session.user.id, "api");
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
      { status: 429 }
    );
  }

  const profile = await fetchProfile(session.user.id);
  if (!profile) {
    return NextResponse.json(
      { success: false, error: "Profile not found" },
      { status: 404 }
    );
  }

  const used = await countImageUploads(session.user.id);
  const tier = getEffectiveTier(profile as { tier: string; trialEndsAt: Date | null });
  const limit = TIER_LIMITS[tier as Tier].imageUploads;

  return NextResponse.json({
    success: true,
    data: { used, limit, remaining: Math.max(0, limit - used) },
  });
}
