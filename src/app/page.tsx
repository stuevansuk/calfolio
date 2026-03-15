export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <span className="text-lg font-bold">Calfolio</span>
          <nav className="flex items-center gap-6">
            <a href="/templates" className="text-sm hover:text-gray-600">
              Templates
            </a>
            <a href="/pricing" className="text-sm hover:text-gray-600">
              Pricing
            </a>
            <a
              href="/app"
              className="rounded-lg bg-black px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              Sign In
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 py-24 text-center">
        <h1 className="text-5xl font-bold leading-tight tracking-tight">
          Beautiful photo calendars,
          <br />
          made simple.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-gray-500">
          Upload your photos, pick a style, and create stunning wall calendars.
          Download print-ready PDFs or order printed calendars delivered to your
          door.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <a
            href="/app/create"
            className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Start Creating
          </a>
          <a
            href="/templates"
            className="rounded-lg border px-6 py-3 text-sm font-medium hover:bg-gray-50"
          >
            Browse Templates
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-gray-50 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            How it works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Choose a template",
                desc: "Pick from 13 professionally designed templates. Minimal, classic, modern, or artistic.",
              },
              {
                step: "2",
                title: "Add your photos",
                desc: "Upload photos and assign them to each month. Crop, position, and add text overlays.",
              },
              {
                step: "3",
                title: "Print or download",
                desc: "Download a print-ready PDF or order printed wall calendars shipped to your door.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black text-lg font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 text-sm text-gray-500">
          <span>&copy; 2026 Calfolio</span>
          <div className="flex gap-4">
            <a href="/terms" className="hover:text-gray-700">
              Terms
            </a>
            <a href="/privacy" className="hover:text-gray-700">
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
