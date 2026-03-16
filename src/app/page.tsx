export default function Home() {
  const templates = [
    { name: "Classic White", category: "classic", bg: "#FFFFFF", accent: "#E7E5E4", text: "#292524" },
    { name: "Modern Dark", category: "modern", bg: "#1C1917", accent: "#44403C", text: "#FAFAF9" },
    { name: "Watercolor", category: "artistic", bg: "#FFF1F2", accent: "#FECDD3", text: "#9F1239" },
    { name: "Bold Color", category: "modern", bg: "#FEF3C7", accent: "#FCD34D", text: "#92400E" },
    { name: "Vintage", category: "classic", bg: "#FEFCE8", accent: "#D6D3D1", text: "#57534E" },
    { name: "Magazine", category: "modern", bg: "#F5F5F4", accent: "#FB7185", text: "#1C1917" },
  ];

  const features = [
    {
      title: "13 Designer Templates",
      desc: "Minimal, classic, modern, and artistic styles. Every template is professionally designed and print-ready.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      ),
    },
    {
      title: "Drag & Drop Editor",
      desc: "Upload photos, assign to months, crop and position. Intuitive editing that anyone can use.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
        </svg>
      ),
    },
    {
      title: "Print-Ready PDFs",
      desc: "Download 300 DPI print-ready PDFs. Professional quality for home printing or print shops.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      ),
    },
    {
      title: "Printed & Delivered",
      desc: "Order printed wall calendars delivered to your door. Premium paper, vibrant colours.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      ),
    },
    {
      title: "A4 & A5 Sizes",
      desc: "Create in A4 or A5 format. Perfect for kitchen walls, office desks, or gifts.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
    {
      title: "Share with Anyone",
      desc: "Generate shareable links to show your calendar design to friends and family before ordering.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
        </svg>
      ),
    },
  ];

  const avatars = [
    { initials: "SK", bg: "bg-rose-100 text-rose-600" },
    { initials: "EM", bg: "bg-amber-100 text-amber-700" },
    { initials: "JC", bg: "bg-stone-200 text-stone-600" },
    { initials: "LP", bg: "bg-rose-200 text-rose-700" },
    { initials: "AW", bg: "bg-amber-50 text-amber-600" },
  ];

  const faqs = [
    {
      q: "How does the free trial work?",
      a: "Sign up and get 7 days to explore Calfolio. Create one calendar, try different templates, and export up to 2 PDFs. No credit card required.",
    },
    {
      q: "What paper sizes are available?",
      a: "We support A4 (210 \u00d7 297mm) and A5 (148 \u00d7 210mm) wall calendars. Both sizes are available for PDF download and printed orders.",
    },
    {
      q: "How long does printing take?",
      a: "Printed calendars are typically produced and shipped within 5\u20137 working days. Express shipping is available at checkout.",
    },
    {
      q: "Can I start my calendar from any month?",
      a: "Yes! Choose any starting month when you create your calendar. Perfect for academic years, financial years, or birthday gifts.",
    },
    {
      q: "What happens after my trial ends?",
      a: "Your calendar designs are saved. You can still view them, but you\u2019ll need a Hobby or Pro plan to export or order prints.",
    },
  ];

  return (
    <main className="min-h-screen bg-stone-50 text-stone-800">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-stone-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="font-[family-name:var(--font-heading)] text-xl font-bold tracking-tight text-stone-800">
            Calfolio
          </span>
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#templates"
              className="text-sm font-medium text-stone-500 transition hover:text-stone-800"
            >
              Templates
            </a>
            <a
              href="#features"
              className="text-sm font-medium text-stone-500 transition hover:text-stone-800"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-stone-500 transition hover:text-stone-800"
            >
              Pricing
            </a>
            <a
              href="/help"
              className="text-sm font-medium text-stone-500 transition hover:text-stone-800"
            >
              Help
            </a>
          </nav>
          <div className="flex items-center gap-3">
            {/* Social icons */}
            <div className="hidden items-center gap-2 md:flex">
              <a
                href="#"
                className="text-stone-400 transition hover:text-rose-500"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href="#"
                className="text-stone-400 transition hover:text-rose-500"
                aria-label="Pinterest"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.182-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.425 1.808-2.425.853 0 1.265.64 1.265 1.408 0 .858-.546 2.14-.828 3.33-.236.995.499 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.515 2.135-4.515 4.34 0 .859.331 1.781.745 2.282a.3.3 0 01.069.288l-.278 1.133c-.044.183-.145.222-.335.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.527-2.291-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                </svg>
              </a>
            </div>
            <div className="hidden h-5 w-px bg-stone-200 md:block" />
            <a
              href="/login"
              className="rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="rounded-full bg-rose-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-rose-600"
            >
              Get Started
            </a>
          </div>
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
              href="#templates"
              className="rounded-full border border-stone-200 bg-white px-8 py-3.5 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
            >
              Browse Templates
            </a>
          </div>
          <p className="mt-4 text-xs text-stone-400">
            7-day free trial. No credit card required.
          </p>

          {/* Social proof */}
          <div className="animate-slide-up delay-300 mt-10 flex flex-col items-center gap-3">
            <div className="flex items-center">
              {avatars.map((avatar, i) => (
                <div
                  key={i}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-semibold ${i > 0 ? "-ml-2" : ""} ${avatar.bg}`}
                >
                  {avatar.initials}
                </div>
              ))}
            </div>
            <p className="text-sm text-stone-400">
              Trusted by creative families everywhere
            </p>
          </div>
        </div>
      </section>

      {/* Template Showcase */}
      <section id="templates" className="border-t border-stone-100 bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-4 text-center text-sm font-semibold uppercase tracking-widest text-rose-500">
            Templates
          </div>
          <h2 className="font-[family-name:var(--font-heading)] text-center text-3xl font-normal tracking-tight text-stone-800">
            Explore our template collection
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-stone-500">
            13 professionally designed styles — from minimal to artistic. Every
            template is fully customisable.
          </p>
          <div className="mt-14 flex gap-5 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
            {templates.map((template) => (
              <div
                key={template.name}
                className="min-w-[220px] flex-shrink-0 rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                {/* Mini template preview */}
                <div
                  className="flex h-[160px] flex-col items-center justify-between rounded-xl p-4"
                  style={{ backgroundColor: template.bg }}
                >
                  {/* Photo placeholder */}
                  <div
                    className="h-16 w-full rounded-lg"
                    style={{ backgroundColor: template.accent }}
                  />
                  {/* Calendar grid placeholder */}
                  <div className="mt-2 grid w-full grid-cols-7 gap-0.5">
                    {Array.from({ length: 21 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-2 rounded-sm"
                        style={{
                          backgroundColor: template.accent,
                          opacity: i % 7 === 0 || i % 7 === 6 ? 0.4 : 0.7,
                        }}
                      />
                    ))}
                  </div>
                  {/* Month text placeholder */}
                  <div
                    className="mt-2 h-2 w-16 rounded-full"
                    style={{ backgroundColor: template.text, opacity: 0.3 }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-stone-800">
                    {template.name}
                  </span>
                  <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium capitalize text-stone-500">
                    {template.category}
                  </span>
                </div>
              </div>
            ))}
            {/* Browse all link card */}
            <a
              href="/templates"
              className="flex min-w-[220px] flex-shrink-0 flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 p-4 text-center transition hover:border-stone-300 hover:bg-stone-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
              <span className="mt-3 text-sm font-medium text-stone-600">
                Browse all 13 templates
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-stone-100 bg-gradient-to-b from-stone-50 to-white py-24">
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

      {/* Features */}
      <section id="features" className="border-t border-stone-100 bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-4 text-center text-sm font-semibold uppercase tracking-widest text-rose-500">
            Features
          </div>
          <h2 className="font-[family-name:var(--font-heading)] text-center text-3xl font-normal tracking-tight text-stone-800">
            Everything you need to create the perfect gift
          </h2>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-base font-semibold text-stone-800">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-500">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-stone-100 bg-gradient-to-b from-stone-50 to-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-4 text-center text-sm font-semibold uppercase tracking-widest text-rose-500">
            Pricing
          </div>
          <h2 className="font-[family-name:var(--font-heading)] text-center text-3xl font-normal tracking-tight text-stone-800">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-stone-500">
            Start free, upgrade when you need more.
          </p>

          <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-3">
            {/* Free Trial */}
            <div className="rounded-2xl border border-stone-200 bg-white p-8">
              <h3 className="text-lg font-bold text-stone-800">Free Trial</h3>
              <p className="mt-2">
                <span className="text-4xl font-bold text-stone-800">Free</span>
                <span className="ml-2 text-sm text-stone-500">/ 7 days</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-stone-700">
                {[
                  "1 calendar",
                  "2 PDF exports",
                  "20 image uploads",
                  "Watermarked exports",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-emerald-500">&#10003;</span> {f}
                  </li>
                ))}
              </ul>
              <a
                href="/register"
                className="mt-8 block w-full rounded-full border border-stone-200 py-2.5 text-center text-sm font-medium text-stone-700 transition hover:bg-stone-50"
              >
                Start Free Trial
              </a>
            </div>

            {/* Hobby */}
            <div className="rounded-2xl border border-stone-200 bg-white p-8">
              <h3 className="text-lg font-bold text-stone-800">Hobby</h3>
              <p className="mt-2">
                <span className="text-4xl font-bold text-stone-800">
                  &pound;5
                </span>
                <span className="text-stone-500">/month</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-stone-700">
                {[
                  "5 active calendars",
                  "10 PDF exports/month",
                  "100 image uploads/month",
                  "No watermark",
                  "Order printed calendars",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-emerald-500">&#10003;</span> {f}
                  </li>
                ))}
              </ul>
              <a
                href="/register"
                className="mt-8 block w-full rounded-full bg-rose-500 py-2.5 text-center text-sm font-medium text-white transition hover:bg-rose-600"
              >
                Get Started
              </a>
            </div>

            {/* Pro */}
            <div className="relative rounded-2xl border border-rose-300 bg-white p-8 ring-1 ring-rose-100">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-rose-500 px-3 py-1 text-xs font-medium text-white">
                Most Popular
              </span>
              <h3 className="text-lg font-bold text-stone-800">Pro</h3>
              <p className="mt-2">
                <span className="text-4xl font-bold text-stone-800">
                  &pound;12
                </span>
                <span className="text-stone-500">/month</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-stone-700">
                {[
                  "Unlimited calendars",
                  "Unlimited PDF exports",
                  "500 image uploads/month",
                  "No watermark",
                  "Premium templates",
                  "Order printed calendars",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-emerald-500">&#10003;</span> {f}
                  </li>
                ))}
              </ul>
              <a
                href="/register"
                className="mt-8 block w-full rounded-full bg-rose-500 py-2.5 text-center text-sm font-medium text-white transition hover:bg-rose-600"
              >
                Get Started
              </a>
            </div>
          </div>

          {/* Print pricing */}
          <div className="mx-auto mt-12 max-w-sm rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-center text-sm font-semibold text-stone-800">
              Print Pricing
            </h3>
            <p className="mt-1 text-center text-xs text-stone-400">
              Order printed wall calendars shipped to your door.
            </p>
            <div className="mt-4 space-y-2 text-sm text-stone-700">
              <div className="flex justify-between">
                <span>A4 Wall Calendar</span>
                <span className="font-medium text-stone-800">
                  from &pound;18
                </span>
              </div>
              <div className="flex justify-between">
                <span>A5 Wall Calendar</span>
                <span className="font-medium text-stone-800">
                  from &pound;15
                </span>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-stone-400">
              Prices include printing and handling. Shipping calculated at
              checkout.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-stone-100 bg-white py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="font-[family-name:var(--font-heading)] text-center text-3xl font-normal tracking-tight text-stone-800">
            Frequently asked questions
          </h2>
          <div className="mt-12 space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-2xl border border-stone-200 bg-white"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 text-sm font-medium text-stone-800">
                  {faq.q}
                  <svg
                    className="h-5 w-5 shrink-0 text-stone-400 transition-transform group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </summary>
                <div className="px-6 pb-4 text-sm leading-relaxed text-stone-500">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-stone-100 bg-stone-800 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-normal tracking-tight text-white">
            Ready to create something beautiful?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-stone-400">
            Start your 7-day free trial today. No credit card required.
          </p>
          <a
            href="/register"
            className="mt-8 inline-block rounded-full bg-rose-500 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-600"
          >
            Get Started Free
          </a>
          <p className="mt-4 text-xs text-stone-500">
            No credit card required &middot; Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-50 pb-10 pt-0">
        <div className="h-px bg-gradient-to-r from-transparent via-rose-200 to-transparent" />
        <div className="mx-auto mt-12 max-w-6xl px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <span className="font-[family-name:var(--font-heading)] text-lg font-bold text-stone-800">
                Calfolio
              </span>
              <p className="mt-3 text-sm leading-relaxed text-stone-500">
                Create stunning personalised photo calendars. The perfect gift
                for family and friends.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold text-stone-800">Product</h4>
              <ul className="mt-3 space-y-2">
                {[
                  { label: "Templates", href: "#templates" },
                  { label: "Features", href: "#features" },
                  { label: "Pricing", href: "#pricing" },
                  { label: "Help", href: "/help" },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-stone-500 transition hover:text-stone-700"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-stone-800">Legal</h4>
              <ul className="mt-3 space-y-2">
                {[
                  { label: "Terms", href: "/terms" },
                  { label: "Privacy", href: "/privacy" },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-stone-500 transition hover:text-stone-700"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="text-sm font-semibold text-stone-800">Social</h4>
              <div className="mt-3 flex items-center gap-3">
                <a
                  href="#"
                  className="text-stone-400 transition hover:text-rose-500"
                  aria-label="Instagram"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="5" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-stone-400 transition hover:text-rose-500"
                  aria-label="Pinterest"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.182-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.425 1.808-2.425.853 0 1.265.64 1.265 1.408 0 .858-.546 2.14-.828 3.33-.236.995.499 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.515 2.135-4.515 4.34 0 .859.331 1.781.745 2.282a.3.3 0 01.069.288l-.278 1.133c-.044.183-.145.222-.335.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.527-2.291-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 border-t border-stone-200 pt-6">
            <p className="text-center text-xs text-stone-400">
              &copy; 2026 Calfolio. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
