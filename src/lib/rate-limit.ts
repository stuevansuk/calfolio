type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
};

const windows = new Map<string, { timestamps: number[] }>();

export const RATE_LIMIT_CONFIGS = {
  auth: { maxRequests: 10, windowMs: 60_000 },
  api: { maxRequests: 200, windowMs: 60_000 },
  imageUpload: { maxRequests: 60, windowMs: 60_000 },
  export: { maxRequests: 10, windowMs: 60_000 },
  stripe: { maxRequests: 10, windowMs: 60_000 },
  feedback: { maxRequests: 20, windowMs: 60_000 },
  contact: { maxRequests: 5, windowMs: 3_600_000 },
  accountDeletion: { maxRequests: 5, windowMs: 86_400_000 },
} as const;

export type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS;

export function checkRateLimit(
  key: string,
  type: RateLimitType
): RateLimitResult {
  const config = RATE_LIMIT_CONFIGS[type];
  return slidingWindowCheck(key, config);
}

function slidingWindowCheck(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  let window = windows.get(key);
  if (!window) {
    window = { timestamps: [] };
    windows.set(key, window);
  }

  // Remove expired entries
  window.timestamps = window.timestamps.filter((t) => t > windowStart);

  const remaining = Math.max(0, config.maxRequests - window.timestamps.length);
  const resetAt = new Date(
    window.timestamps.length > 0
      ? window.timestamps[0] + config.windowMs
      : now + config.windowMs
  );

  if (window.timestamps.length >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt };
  }

  window.timestamps.push(now);
  return { allowed: true, remaining: remaining - 1, resetAt };
}

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const maxWindow = Math.max(
    ...Object.values(RATE_LIMIT_CONFIGS).map((c) => c.windowMs)
  );

  for (const [key, window] of windows.entries()) {
    window.timestamps = window.timestamps.filter(
      (t) => t > now - maxWindow
    );
    if (window.timestamps.length === 0) {
      windows.delete(key);
    }
  }
}, 300_000);
