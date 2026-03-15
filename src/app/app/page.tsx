"use client";

import { useAppStore } from "@/stores/app-store";
import { useAuth } from "@/contexts/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();
  const { projects } = useAppStore();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 font-[family-name:var(--font-heading)]">My Calendars</h1>
          <p className="text-sm text-stone-500">
            {projects.length} calendar{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <a
          href="/app/create"
          className="rounded-full bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 focus:ring-2 focus:ring-rose-300 focus:ring-offset-2"
        >
          Create Calendar
        </a>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-stone-200 bg-gradient-to-br from-rose-50 to-amber-50 p-12 text-center">
          <h2 className="text-lg font-medium text-stone-800 font-[family-name:var(--font-heading)]">
            No calendars yet
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            Create your first photo calendar to get started.
          </p>
          <a
            href="/app/create"
            className="mt-4 inline-block rounded-full bg-rose-500 px-6 py-2 text-sm font-medium text-white hover:bg-rose-600 focus:ring-2 focus:ring-rose-300 focus:ring-offset-2"
          >
            Create Your First Calendar
          </a>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <a
              key={project.id}
              href={`/app/calendars/${project.id}/edit`}
              className="rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-3 aspect-[4/3] rounded-xl bg-gradient-to-br from-rose-50 to-amber-50" />
              <h3 className="font-medium text-stone-800">{project.title}</h3>
              <div className="mt-1 flex items-center gap-2 text-xs text-stone-500">
                <span>{project.calendarYear}</span>
                <span className="capitalize">{project.status}</span>
                <span>{project.paperSize}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
