export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-800">
      {/* Header */}
      <header className="border-b border-stone-100">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="font-[family-name:var(--font-heading)] text-xl font-bold tracking-tight text-stone-800">
            Calfolio
          </span>
          <nav className="flex items-center gap-8">
            <a
              href="/templates"
              className="text-sm font-medium text-stone-500 transition hover:text-stone-800"
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
      <section className="relative overflow-hidden bg-stone-50">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-50 via-amber-50/50 to-stone-50" />
        <div className="relative mx-auto max-w-4xl px-6 pb-24 pt-28 text-center">
          <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-700">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            13 beautiful templates to choose from
          </div>
          <h1 className="animate-slide-up delay-75 font-[family-name:var(--font-heading)] text-5xl font-normal leading-[1.1] tracking-tight text-stone-800 sm:text-6xl">
            Beautiful photo calendars,
            <br />
            <span className="bg-gradient-to-r from-rose-500 to-orange-400 bg-clip-text text-transparent">
              made simple.
            </span>
          </h1>
          <p className="animate-slide-up delay-150 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-stone-500">
            Upload your favourite photos, pick a style, and create stunning
            personalised wall calendars. Download print-ready PDFs or order
            printed calendars delivered to your door.
          </p>
          <div className="animate-slide-up delay-225 mt-10 flex items-center justify-center gap-4">
            <a
              href="/register"
              className="rounded-full bg-rose-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-600 hover:shadow-xl"
            >
              Start Creating — Free
            </a>
            <a
              href="/templates"
              className="rounded-full border border-stone-200 bg-white px-8 py-3.5 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
            >
              Browse Templates
            </a>
          </div>
          <p className="mt-4 text-xs text-stone-400">
            7-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gradient-to-b from-stone-50 to-white border-t border-stone-100 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-4 text-center text-sm font-semibold uppercase tracking-widest text-rose-500">
            How it works
          </div>
          <h2 className="font-[family-name:var(--font-heading)] mb-16 text-center text-3xl font-normal tracking-tight text-stone-800">
            Three steps to your perfect calendar
          </h2>
          <div className="grid gap-12 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Choose a template",
                desc: "Pick from 13 professionally designed templates — minimal, classic, modern, or artistic styles.",
                icon: (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                    />
                  </svg>
                ),
              },
              {
                step: "2",
                title: "Add your photos",
                desc: "Upload photos and assign them to each month. Crop, position, and add text overlays with ease.",
                icon: (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                    />
                  </svg>
                ),
              },
              {
                step: "3",
                title: "Print or download",
                desc: "Download a print-ready PDF or order printed wall calendars shipped directly to your door.",
                icon: (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
                    />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-3 flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-xs font-semibold text-rose-600">
                  {item.step}
                </div>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                  {item.icon}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-stone-800">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-500">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof / stats */}
      <section className="border-t border-stone-100 bg-white py-16">
        <div className="mx-auto grid max-w-4xl gap-8 px-6 text-center md:grid-cols-3">
          <div>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
              <span className="text-3xl font-bold text-stone-800">13</span>
            </div>
            <div className="mt-3 text-sm text-stone-500">
              Designer templates
            </div>
          </div>
          <div>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
              <span className="text-lg font-bold text-stone-800">A4 &amp; A5</span>
            </div>
            <div className="mt-3 text-sm text-stone-500">
              Paper sizes supported
            </div>
          </div>
          <div>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
              <span className="text-lg font-bold text-stone-800">300 DPI</span>
            </div>
            <div className="mt-3 text-sm text-stone-500">
              Print-ready quality
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-stone-100 bg-stone-800 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-normal tracking-tight text-white">
            Ready to create your calendar?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-stone-400">
            Start your 7-day free trial today. No credit card required. Create
            your first calendar in minutes.
          </p>
          <a
            href="/register"
            className="mt-8 inline-block rounded-full bg-rose-500 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-600"
          >
            Get Started Free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-50 pt-0 pb-10">
        <div className="h-px bg-gradient-to-r from-transparent via-rose-200 to-transparent" />
        <div className="mx-auto mt-10 flex max-w-6xl items-center justify-between px-6">
          <div>
            <span className="font-semibold text-stone-800">Calfolio</span>
            <p className="mt-1 text-xs text-stone-400">
              &copy; 2026 Calfolio. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6">
            <a
              href="/pricing"
              className="text-sm text-stone-500 transition hover:text-stone-700"
            >
              Pricing
            </a>
            <a
              href="/templates"
              className="text-sm text-stone-500 transition hover:text-stone-700"
            >
              Templates
            </a>
            <a
              href="/terms"
              className="text-sm text-stone-500 transition hover:text-stone-700"
            >
              Terms
            </a>
            <a
              href="/privacy"
              className="text-sm text-stone-500 transition hover:text-stone-700"
            >
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
