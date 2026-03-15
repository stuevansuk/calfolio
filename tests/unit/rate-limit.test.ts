import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We need fresh module state per test, so we use dynamic imports with resetModules
describe("rate-limit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2027-01-15T12:00:00Z"));
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function getModule() {
    const mod = await import("@/lib/rate-limit");
    return mod;
  }

  describe("checkRateLimit", () => {
    it("returns allowed:true when under limit", async () => {
      const { checkRateLimit } = await getModule();
      const result = checkRateLimit("user-1", "auth");
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThanOrEqual(0);
      expect(result.resetAt).toBeInstanceOf(Date);
    });

    it("returns allowed:false when limit reached", async () => {
      const { checkRateLimit, RATE_LIMIT_CONFIGS } = await getModule();
      const limit = RATE_LIMIT_CONFIGS.auth.maxRequests;

      // Exhaust the limit
      for (let i = 0; i < limit; i++) {
        const r = checkRateLimit("user-exhaust", "auth");
        expect(r.allowed).toBe(true);
      }

      // Next request should be blocked
      const result = checkRateLimit("user-exhaust", "auth");
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("tracks remaining count correctly", async () => {
      const { checkRateLimit, RATE_LIMIT_CONFIGS } = await getModule();
      const limit = RATE_LIMIT_CONFIGS.auth.maxRequests; // 10

      // Before first call: 0 timestamps. remaining = max(0, 10 - 0) = 10.
      // After push: returns remaining - 1 = 9.
      const first = checkRateLimit("user-remaining", "auth");
      expect(first.remaining).toBe(limit - 1);

      // Before second call: 1 timestamp. remaining = max(0, 10 - 1) = 9.
      // After push: returns remaining - 1 = 8.
      const second = checkRateLimit("user-remaining", "auth");
      expect(second.remaining).toBe(limit - 2);
    });

    it("does not interfere between different keys", async () => {
      const { checkRateLimit, RATE_LIMIT_CONFIGS } = await getModule();
      const limit = RATE_LIMIT_CONFIGS.auth.maxRequests;

      // Exhaust limit for key A
      for (let i = 0; i < limit; i++) {
        checkRateLimit("key-A", "auth");
      }

      // Key B should still be allowed
      const result = checkRateLimit("key-B", "auth");
      expect(result.allowed).toBe(true);
    });

    it("allows requests again after window expires", async () => {
      const { checkRateLimit, RATE_LIMIT_CONFIGS } = await getModule();
      const limit = RATE_LIMIT_CONFIGS.auth.maxRequests;
      const windowMs = RATE_LIMIT_CONFIGS.auth.windowMs;

      // Exhaust the limit
      for (let i = 0; i < limit; i++) {
        checkRateLimit("user-window", "auth");
      }

      // Should be blocked
      expect(checkRateLimit("user-window", "auth").allowed).toBe(false);

      // Advance time past window
      vi.advanceTimersByTime(windowMs + 1);

      // Should be allowed again
      const result = checkRateLimit("user-window", "auth");
      expect(result.allowed).toBe(true);
    });

    it("works correctly with api config (200/min)", async () => {
      const { checkRateLimit, RATE_LIMIT_CONFIGS } = await getModule();
      const limit = RATE_LIMIT_CONFIGS.api.maxRequests; // 200

      // Make 200 requests
      for (let i = 0; i < limit; i++) {
        const r = checkRateLimit("user-api", "api");
        expect(r.allowed).toBe(true);
      }

      // 201st should be blocked
      const blocked = checkRateLimit("user-api", "api");
      expect(blocked.allowed).toBe(false);
    });

    it("returns a resetAt date in the future", async () => {
      const { checkRateLimit } = await getModule();
      const result = checkRateLimit("user-reset", "auth");
      expect(result.resetAt.getTime()).toBeGreaterThan(Date.now());
    });

    it("uses correct window for contact rate limit (1 hour)", async () => {
      const { checkRateLimit, RATE_LIMIT_CONFIGS } = await getModule();
      const limit = RATE_LIMIT_CONFIGS.contact.maxRequests; // 5

      // Exhaust
      for (let i = 0; i < limit; i++) {
        checkRateLimit("ip-contact", "contact");
      }

      // Blocked
      expect(checkRateLimit("ip-contact", "contact").allowed).toBe(false);

      // Advance 59 minutes - still blocked
      vi.advanceTimersByTime(59 * 60 * 1000);
      expect(checkRateLimit("ip-contact", "contact").allowed).toBe(false);

      // Advance past 1 hour total
      vi.advanceTimersByTime(2 * 60 * 1000);
      expect(checkRateLimit("ip-contact", "contact").allowed).toBe(true);
    });
  });

  describe("RATE_LIMIT_CONFIGS", () => {
    it("defines auth config with 10 requests per minute", async () => {
      const { RATE_LIMIT_CONFIGS } = await getModule();
      expect(RATE_LIMIT_CONFIGS.auth.maxRequests).toBe(10);
      expect(RATE_LIMIT_CONFIGS.auth.windowMs).toBe(60_000);
    });

    it("defines api config with 200 requests per minute", async () => {
      const { RATE_LIMIT_CONFIGS } = await getModule();
      expect(RATE_LIMIT_CONFIGS.api.maxRequests).toBe(200);
      expect(RATE_LIMIT_CONFIGS.api.windowMs).toBe(60_000);
    });

    it("defines accountDeletion config with 24-hour window", async () => {
      const { RATE_LIMIT_CONFIGS } = await getModule();
      expect(RATE_LIMIT_CONFIGS.accountDeletion.maxRequests).toBe(5);
      expect(RATE_LIMIT_CONFIGS.accountDeletion.windowMs).toBe(86_400_000);
    });
  });
});
