"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useAppStore } from "@/stores/app-store";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const storeUser = useAppStore((s) => s.user);
  const [name, setName] = useState(storeUser?.name || "");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
    } finally {
      setSaving(false);
    }
  }

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
      <h1 className="text-2xl font-bold text-stone-800 font-[family-name:var(--font-heading)]">Settings</h1>

      {/* Profile */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-4 font-medium text-stone-800">Profile</h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Email</label>
            <input
              type="text"
              value={user?.email || ""}
              disabled
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-rose-300 focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 focus:outline-none"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 disabled:opacity-50 focus:ring-2 focus:ring-rose-300 focus:ring-offset-2"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </section>

      {/* Plan */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-4 font-medium text-stone-800">Plan</h2>
        <p className="text-sm text-stone-600">
          Current plan:{" "}
          <span className="font-medium capitalize text-stone-800">
            {storeUser?.tier || "trial"}
          </span>
        </p>
        <a
          href="/pricing"
          className="mt-3 inline-block text-sm text-rose-600 hover:text-rose-700 hover:underline"
        >
          Upgrade plan &rarr;
        </a>
      </section>

      {/* Danger Zone */}
      <section className="rounded-2xl border border-red-200 bg-red-50/50 p-4">
        <h2 className="mb-4 font-medium text-red-600">Danger Zone</h2>
        <p className="mb-3 text-sm text-stone-500">
          Type your email to confirm account deletion.
        </p>
        <input
          type="text"
          value={deleteConfirm}
          onChange={(e) => setDeleteConfirm(e.target.value)}
          placeholder={user?.email}
          className="mb-3 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-red-300 focus:ring-2 focus:ring-red-300 focus:ring-offset-2 focus:outline-none"
        />
        <button
          onClick={handleDelete}
          disabled={deleteConfirm !== user?.email}
          className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
        >
          Delete Account
        </button>
      </section>

      <button
        onClick={signOut}
        className="w-full rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
      >
        Sign Out
      </button>
    </div>
  );
}
