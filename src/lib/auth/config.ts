import { betterAuth } from "better-auth";
import { Pool } from "pg";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _auth: any = null;

function initAuth() {
  if (!_auth) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    _auth = betterAuth({
      database: pool,
      session: {
        expiresIn: 60 * 60 * 24, // 24 hours
        updateAge: 60 * 60, // 1 hour
        cookieCache: {
          enabled: true,
          maxAge: 5 * 60, // 5 minutes
        },
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

export const auth = {
  get api() {
    return initAuth().api;
  },
  get handler() {
    return initAuth().handler;
  },
};
