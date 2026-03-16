"use client";

import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/templates", label: "Templates" },
  { href: "/pricing", label: "Pricing" },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-100 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a
            href="/"
            className="font-[family-name:var(--font-heading)] text-xl text-stone-800"
          >
            Calfolio
          </a>
          <nav className="flex items-center gap-8">
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
            <a
              href="/login"
              className="rounded-full bg-rose-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-rose-600"
            >
              Sign In
            </a>
          </nav>
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
