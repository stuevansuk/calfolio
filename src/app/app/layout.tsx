"use client";

import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { useAppStore } from "@/stores/app-store";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { TrialCountdownBanner } from "@/components/tier/TrialCountdownBanner";
import { ExpiredTrialOverlay } from "@/components/tier/ExpiredTrialOverlay";
import { TierBadge } from "@/components/tier/TierBadge";
import { getEffectiveTier } from "@/lib/tier-check";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const storeUser = useAppStore((s) => s.user);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-300 border-t-rose-500" />
      </div>
    );
  }

  if (!user) return null;

  const effectiveTier = storeUser
    ? getEffectiveTier(storeUser)
    : null;

  return (
    <div className="min-h-screen bg-stone-50">
      <TrialCountdownBanner />
      <header className="sticky top-0 z-40 border-b border-stone-100 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <a href="/app" className="text-lg font-bold text-stone-800 font-[family-name:var(--font-heading)]">
            Calfolio
          </a>
          <nav className="hidden items-center gap-6 md:flex">
            {[
              { href: "/app", label: "Dashboard", exact: true },
              { href: "/app/create", label: "Create" },
              { href: "/app/orders", label: "Orders" },
              { href: "/app/settings", label: "Settings" },
            ].map((link) => {
              const isActive = link.exact
                ? pathname === link.href
                : pathname.startsWith(link.href);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition ${
                    isActive
                      ? "text-rose-600"
                      : "text-stone-500 hover:text-stone-700"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
            <a
              href="/app/admin/metrics"
              className={`text-sm font-medium transition ${
                pathname.startsWith("/app/admin")
                  ? "text-rose-600"
                  : "text-stone-400 hover:text-stone-700"
              }`}
            >
              Admin
            </a>
          </nav>
          <div className="flex items-center gap-3">
            {effectiveTier && <TierBadge tier={effectiveTier} />}
            <span className="text-sm text-stone-500">{user.email}</span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 border-t border-stone-100 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="flex justify-around py-2">
          {[
            { href: "/app", label: "Dashboard", exact: true },
            { href: "/app/create", label: "Create" },
            { href: "/app/orders", label: "Orders" },
            { href: "/app/settings", label: "Settings" },
          ].map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            return (
              <a
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center text-xs font-medium ${
                  isActive
                    ? "text-rose-600"
                    : "text-stone-500 hover:text-rose-600"
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </div>
      </nav>
      <ExpiredTrialOverlay />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGate>{children}</AuthGate>
    </AuthProvider>
  );
}
