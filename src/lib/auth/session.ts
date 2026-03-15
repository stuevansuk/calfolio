import { auth } from "./config";
import { headers } from "next/headers";

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export function isAdmin(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS;
  if (!adminEmails) return false;
  return adminEmails.split(",").map((e) => e.trim()).includes(email);
}
