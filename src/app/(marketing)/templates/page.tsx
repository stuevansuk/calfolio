import { TemplatePreview } from "@/components/calendar/TemplatePreview";
import type { TemplateConfig, CalendarTemplate } from "@/types";

const CATEGORIES = ["all", "minimal", "classic", "modern", "artistic"] as const;

async function getTemplates(): Promise<CalendarTemplate[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/templates`, {
      next: { revalidate: 3600 },
    });
    const json = await res.json();
    return json.success ? json.data : [];
  } catch {
    return [];
  }
}

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="border-b border-stone-100 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a
            href="/"
            className="font-[family-name:var(--font-heading)] text-xl text-stone-800"
          >
            Calfolio
          </a>
          <nav className="flex items-center gap-8">
            <a
              href="/templates"
              className="text-sm font-medium text-rose-600"
            >
              Templates
            </a>
            <a
              href="/pricing"
              className="text-sm font-medium text-stone-500 transition hover:text-stone-800"
            >
              Pricing
            </a>
            <a
              href="/login"
              className="rounded-full bg-rose-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-rose-600"
            >
              Sign In
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-rose-50/50 to-stone-50 py-20 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl text-stone-800 sm:text-5xl">
            13 Beautiful Templates
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-stone-500">
            Every template is professionally designed and fully customisable.
            Pick a style, add your photos, and make it yours.
          </p>
        </div>
      </section>

      {/* Template Grid */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-8">
        {/* Category labels */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.filter((c) => c !== "all").map((cat) => {
            const count = templates.filter((t) => t.category === cat).length;
            return (
              <span
                key={cat}
                className="rounded-full bg-stone-100 px-4 py-1.5 text-sm font-medium capitalize text-stone-600"
              >
                {cat} ({count})
              </span>
            );
          })}
        </div>

        {templates.length === 0 ? (
          <p className="text-center text-stone-400">
            Templates will appear here once the database is seeded.
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => {
              const config = template.config as TemplateConfig;
              return (
                <div
                  key={template.id}
                  className="group rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="overflow-hidden rounded-xl border border-stone-100">
                    <TemplatePreview
                      config={config}
                      className="w-full"
                    />
                  </div>
                  <div className="mt-4 flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-stone-800">
                        {template.name}
                      </h3>
                      <p className="mt-1 text-sm text-stone-500">
                        {template.description}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 ml-3">
                      {template.isPremium && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                          Pro
                        </span>
                      )}
                      <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium capitalize text-stone-500">
                        {template.category}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-xs text-stone-400">
                    <span className="capitalize">{config.orientation}</span>
                    <span className="h-3 w-px bg-stone-200" />
                    <span>{config.supportedSizes.join(" / ")}</span>
                    <span className="h-3 w-px bg-stone-200" />
                    <span>{config.dpi} DPI</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <a
            href="/register"
            className="inline-block rounded-full bg-rose-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-600"
          >
            Start Creating — Free
          </a>
          <p className="mt-3 text-xs text-stone-400">
            7-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-100 bg-stone-50 py-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <div>
            <span className="font-semibold text-stone-800">Calfolio</span>
            <p className="mt-1 text-xs text-stone-400">
              &copy; 2026 Calfolio. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6">
            <a href="/pricing" className="text-sm text-stone-500 transition hover:text-stone-700">Pricing</a>
            <a href="/templates" className="text-sm text-stone-500 transition hover:text-stone-700">Templates</a>
            <a href="/terms" className="text-sm text-stone-500 transition hover:text-stone-700">Terms</a>
            <a href="/privacy" className="text-sm text-stone-500 transition hover:text-stone-700">Privacy</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
