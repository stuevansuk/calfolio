import { toNextJsHandler } from "better-auth/next-js";
import { betterAuth } from "better-auth";
import { Pool } from "pg";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _auth: any = null;

function getAuth() {
  if (!_auth) {
    _auth = betterAuth({
      database: new Pool({ connectionString: process.env.DATABASE_URL }),
      session: {
        expiresIn: 60 * 60 * 24,
        updateAge: 60 * 60,
        cookieCache: { enabled: true, maxAge: 5 * 60 },
      },
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
      },
      socialProviders: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
      },
      account: {
        accountLinking: {
          enabled: true,
          trustedProviders: ["google"],
        },
      },
      trustedOrigins: process.env.TRUSTED_ORIGINS?.split(",") ?? [],
    });
  }
  return _auth;
}

export async function GET(request: Request) {
  const handler = toNextJsHandler(getAuth());
  return handler.GET!(request);
}

export async function POST(request: Request) {
  const handler = toNextJsHandler(getAuth());
  return handler.POST!(request);
}
