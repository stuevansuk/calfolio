"use client";

import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <a href="/app" className="text-lg font-bold">
            Calfolio
          </a>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="/app" className="text-sm hover:text-gray-600">
              Dashboard
            </a>
            <a href="/app/create" className="text-sm hover:text-gray-600">
              Create
            </a>
            <a href="/app/orders" className="text-sm hover:text-gray-600">
              Orders
            </a>
            <a href="/app/settings" className="text-sm hover:text-gray-600">
              Settings
            </a>
          </nav>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 border-t bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="flex justify-around py-2">
          <a href="/app" className="flex flex-col items-center text-xs">
            Dashboard
          </a>
          <a href="/app/create" className="flex flex-col items-center text-xs">
            Create
          </a>
          <a href="/app/orders" className="flex flex-col items-center text-xs">
            Orders
          </a>
          <a
            href="/app/settings"
            className="flex flex-col items-center text-xs"
          >
            Settings
          </a>
        </div>
      </nav>
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
