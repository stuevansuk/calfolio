import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod/v4";

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email().max(200),
  message: z.string().min(10).max(5000),
});

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  const rl = checkRateLimit(`ip:${ip}`, "contact");
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests" },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid input" },
      { status: 400 }
    );
  }

  // TODO: Send email via Resend
  console.log("Contact form submission:", parsed.data);

  return NextResponse.json({ success: true });
}
