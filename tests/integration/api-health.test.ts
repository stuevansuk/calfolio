import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    execute: vi.fn().mockResolvedValue([{ rows: [{ "?column?": 1 }] }]),
  },
}));

vi.mock("drizzle-orm", () => ({
  sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({
    strings,
    values,
  }),
}));

const { db } = await import("@/lib/db");
const { GET } = await import("@/app/api/health/route");

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 when DB is healthy", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe("ok");
  });

  it("calls db.execute to check connectivity", async () => {
    await GET();
    expect(db.execute).toHaveBeenCalledTimes(1);
  });

  it("returns 503 when DB query fails", async () => {
    vi.mocked(db.execute).mockRejectedValueOnce(new Error("Connection refused"));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Database connection failed");
  });

  it("does not expose error details to the client", async () => {
    vi.mocked(db.execute).mockRejectedValueOnce(
      new Error("FATAL: password authentication failed for user 'admin'")
    );

    const response = await GET();
    const data = await response.json();

    expect(data.error).toBe("Database connection failed");
    expect(data.error).not.toContain("password");
  });

  it("returns JSON content type", async () => {
    const response = await GET();
    expect(response.headers.get("content-type")).toContain("application/json");
  });

  it("returns success:true in the envelope on success", async () => {
    const response = await GET();
    const data = await response.json();
    expect(data).toHaveProperty("success", true);
    expect(data).toHaveProperty("data");
  });
});
