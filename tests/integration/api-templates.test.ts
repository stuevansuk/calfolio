import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockFetchTemplates = vi.fn();
const mockFetchTemplate = vi.fn();

vi.mock("@/lib/db/api", () => ({
  fetchTemplates: (...args: unknown[]) => mockFetchTemplates(...args),
  fetchTemplate: (...args: unknown[]) => mockFetchTemplate(...args),
}));

const sampleTemplates = [
  {
    id: "tpl-1",
    name: "Minimal Light",
    description: "A clean minimal template",
    category: "minimal",
    thumbnailUrl: null,
    previewImages: null,
    isPremium: false,
    isActive: true,
    sortOrder: 1,
    createdAt: new Date("2027-01-01"),
    config: {},
  },
  {
    id: "tpl-2",
    name: "Modern Bold",
    description: "A modern bold template",
    category: "modern",
    thumbnailUrl: null,
    previewImages: null,
    isPremium: true,
    isActive: true,
    sortOrder: 2,
    createdAt: new Date("2027-01-02"),
    config: {},
  },
  {
    id: "tpl-3",
    name: "Classic Serif",
    description: "A classic serif template",
    category: "classic",
    thumbnailUrl: null,
    previewImages: null,
    isPremium: false,
    isActive: true,
    sortOrder: 3,
    createdAt: new Date("2027-01-03"),
    config: {},
  },
];

// -----------------------------------------------------------------------
// GET /api/templates
// -----------------------------------------------------------------------

describe("GET /api/templates", () => {
  let GET: (request: NextRequest) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockFetchTemplates.mockResolvedValue(sampleTemplates);
    const mod = await import("@/app/api/templates/route");
    GET = mod.GET;
  });

  it("returns success with templates array", async () => {
    const request = new NextRequest("http://localhost:3000/api/templates");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(3);
  });

  it("passes category filter to fetchTemplates", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/templates?category=modern"
    );
    await GET(request);

    expect(mockFetchTemplates).toHaveBeenCalledWith({ category: "modern" });
  });

  it("passes undefined category when no query param", async () => {
    const request = new NextRequest("http://localhost:3000/api/templates");
    await GET(request);

    expect(mockFetchTemplates).toHaveBeenCalledWith({ category: undefined });
  });

  it("returns filtered results based on fetchTemplates response", async () => {
    mockFetchTemplates.mockResolvedValue(
      sampleTemplates.filter((t) => t.category === "modern")
    );

    const request = new NextRequest(
      "http://localhost:3000/api/templates?category=modern"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(data.data).toHaveLength(1);
    expect(data.data[0].name).toBe("Modern Bold");
  });

  it("returns empty array when no templates match", async () => {
    mockFetchTemplates.mockResolvedValue([]);

    const request = new NextRequest(
      "http://localhost:3000/api/templates?category=seasonal"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(0);
  });
});

// -----------------------------------------------------------------------
// GET /api/templates/[id]
// -----------------------------------------------------------------------

describe("GET /api/templates/[id]", () => {
  let GET: (
    request: Request,
    context: { params: Promise<{ id: string }> }
  ) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/app/api/templates/[id]/route");
    GET = mod.GET;
  });

  it("returns single template by id", async () => {
    mockFetchTemplate.mockResolvedValue(sampleTemplates[0]);

    const response = await GET(new Request("http://localhost:3000/api/templates/tpl-1"), {
      params: Promise.resolve({ id: "tpl-1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe("tpl-1");
    expect(data.data.name).toBe("Minimal Light");
  });

  it("returns 404 for unknown id", async () => {
    mockFetchTemplate.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost:3000/api/templates/unknown"), {
      params: Promise.resolve({ id: "unknown" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Template not found");
  });

  it("passes the id from params to fetchTemplate", async () => {
    mockFetchTemplate.mockResolvedValue(sampleTemplates[1]);

    await GET(new Request("http://localhost:3000/api/templates/tpl-2"), {
      params: Promise.resolve({ id: "tpl-2" }),
    });

    expect(mockFetchTemplate).toHaveBeenCalledWith("tpl-2");
  });

  it("returns premium template data", async () => {
    mockFetchTemplate.mockResolvedValue(sampleTemplates[1]);

    const response = await GET(new Request("http://localhost:3000/api/templates/tpl-2"), {
      params: Promise.resolve({ id: "tpl-2" }),
    });
    const data = await response.json();

    expect(data.data.isPremium).toBe(true);
  });

  it("returns success envelope structure on found", async () => {
    mockFetchTemplate.mockResolvedValue(sampleTemplates[2]);

    const response = await GET(new Request("http://localhost:3000/api/templates/tpl-3"), {
      params: Promise.resolve({ id: "tpl-3" }),
    });
    const data = await response.json();

    expect(data).toHaveProperty("success", true);
    expect(data).toHaveProperty("data");
    expect(data).not.toHaveProperty("error");
  });
});
