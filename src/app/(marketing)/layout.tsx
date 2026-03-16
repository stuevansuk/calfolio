"use client";

import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/templates", label: "Templates" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/help", label: "Help" },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-100">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a
            href="/"
            className="font-[family-name:var(--font-heading)] text-xl text-stone-800"
          >
            Calfolio
          </a>
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition ${
                  pathname === link.href
                    ? "text-rose-600"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {link.label}
              </a>
            ))}
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

      {children}

      <footer className="border-t border-stone-100 bg-stone-50 py-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
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
    </div>
  );
}
