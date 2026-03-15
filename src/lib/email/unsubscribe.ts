import { createHmac } from "crypto";

export function generateUnsubscribeUrl(
  userId: string,
  appUrl: string
): string {
  const token = createHmac("sha256", process.env.BETTER_AUTH_SECRET!)
    .update(userId)
    .digest("hex");
  return `${appUrl}/api/email/unsubscribe?token=${token}&uid=${userId}`;
}
