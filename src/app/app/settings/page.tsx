"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useAppStore } from "@/stores/app-store";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const storeUser = useAppStore((s) => s.user);
  const [name, setName] = useState(storeUser?.name || "");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  // Auto-clear save success message after 3 seconds
  useEffect(() => {
    if (!saveSuccess) return;
    const timer = setTimeout(() => setSaveSuccess(false), 3000);
    return () => clearTimeout(timer);
  }, [saveSuccess]);

  // Auto-clear save error message after 5 seconds
  useEffect(() => {
    if (!saveError) return;
    const timer = setTimeout(() => setSaveError(null), 5000);
    return () => clearTimeout(timer);
  }, [saveError]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setSaveSuccess(true);
      } else {
        setSaveError("Failed to save. Please try again.");
      }
    } catch {
      setSaveError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [name]);

  async function handleDelete() {
    if (deleteConfirm !== user?.email) return;
    await fetch("/api/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmEmail: deleteConfirm }),
    });
    signOut();
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-stone-800 font-[family-name:var(--font-heading)]">
        Settings
      </h1>

      {/* Profile */}
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-medium text-stone-800">Profile</h2>
        <p className="mt-0.5 mb-4 text-sm text-stone-400">
          Manage your account details
        </p>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Email
            </label>
            <input
              type="text"
              value={user?.email || ""}
              disabled
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm transition-colors duration-200 focus:border-rose-300 focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-rose-500 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-rose-600 disabled:opacity-50 focus:ring-2 focus:ring-rose-300 focus:ring-offset-2"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            {/* Success toast */}
            <span
              className={`text-sm font-medium text-emerald-600 transition-opacity duration-300 ${
                saveSuccess ? "opacity-100" : "opacity-0"
              }`}
            >
              Saved successfully
            </span>
            {/* Error toast */}
            {saveError && (
              <span className="text-sm font-medium text-red-600">
                {saveError}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Plan */}
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-medium text-stone-800">Plan</h2>
        <p className="mt-0.5 mb-4 text-sm text-stone-400">
          Your current subscription plan
        </p>
        <p className="text-sm text-stone-600">
          Current plan:{" "}
          <span className="font-medium capitalize text-stone-800">
            {storeUser?.tier || "trial"}
          </span>
        </p>
        <a
          href="/pricing"
          className="mt-3 inline-block text-sm text-rose-600 transition-colors duration-200 hover:text-rose-700 hover:underline"
        >
          Upgrade plan &rarr;
        </a>
        <p className="mt-4 text-xs text-stone-400">
          To change your password or manage sign-in methods, contact support.
        </p>
      </section>

      {/* Sign Out */}
      <button
        onClick={signOut}
        className="w-full rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 transition-colors duration-200 hover:bg-stone-50"
      >
        Sign Out
      </button>

      {/* Visual separator before danger zone */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-200" />
        </div>
      </div>

      {/* Danger Zone */}
      <section className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
        <h2 className="font-medium text-red-600">Danger Zone</h2>
        <p className="mt-0.5 mb-4 text-sm text-stone-500">
          Type your email to confirm account deletion. This action cannot be undone.
        </p>
        <input
          type="text"
          value={deleteConfirm}
          onChange={(e) => setDeleteConfirm(e.target.value)}
          placeholder={user?.email}
          className="mb-3 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm transition-colors duration-200 focus:border-red-300 focus:ring-2 focus:ring-red-300 focus:ring-offset-2 focus:outline-none"
        />
        <button
          onClick={handleDelete}
          disabled={deleteConfirm !== user?.email}
          className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-700 disabled:opacity-50 focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
        >
          Delete Account
        </button>
      </section>
    </div>
  );
}
