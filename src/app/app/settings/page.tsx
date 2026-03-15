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
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Profile */}
      <section className="rounded-lg border bg-white p-4">
        <h2 className="mb-4 font-medium">Profile</h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="text"
              value={user?.email || ""}
              disabled
              className="w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </section>

      {/* Plan */}
      <section className="rounded-lg border bg-white p-4">
        <h2 className="mb-4 font-medium">Plan</h2>
        <p className="text-sm">
          Current plan:{" "}
          <span className="font-medium capitalize">
            {storeUser?.tier || "trial"}
          </span>
        </p>
        <a
          href="/pricing"
          className="mt-3 inline-block text-sm text-blue-600 hover:underline"
        >
          Upgrade plan &rarr;
        </a>
      </section>

      {/* Danger Zone */}
      <section className="rounded-lg border border-red-200 bg-white p-4">
        <h2 className="mb-4 font-medium text-red-600">Danger Zone</h2>
        <p className="mb-3 text-sm text-gray-500">
          Type your email to confirm account deletion.
        </p>
        <input
          type="text"
          value={deleteConfirm}
          onChange={(e) => setDeleteConfirm(e.target.value)}
          placeholder={user?.email}
          className="mb-3 w-full rounded-lg border px-3 py-2 text-sm"
        />
        <button
          onClick={handleDelete}
          disabled={deleteConfirm !== user?.email}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          Delete Account
        </button>
      </section>

      <button
        onClick={signOut}
        className="w-full rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
      >
        Sign Out
      </button>
    </div>
  );
}
