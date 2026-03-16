"use client";

import { useAppStore } from "@/stores/app-store";
import { useAuth } from "@/contexts/auth-context";
import { useMemo } from "react";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getRelativeTime(date: Date | string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `Edited ${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `Edited ${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays === 1) return "Edited yesterday";
  if (diffDays < 30) return `Edited ${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return "Edited 1 month ago";
  return `Edited ${diffMonths} months ago`;
}

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: "bg-amber-50", text: "text-amber-700", label: "Draft" },
  completed: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Completed" },
  ordered: { bg: "bg-rose-50", text: "text-rose-700", label: "Ordered" },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { projects, templates } = useAppStore();
  const storeUser = useAppStore((s) => s.user);

  const firstName = useMemo(() => {
    const fullName = storeUser?.name;
    if (!fullName) return "there";
    return fullName.split(" ")[0];
  }, [storeUser?.name]);

  const templateMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of templates) {
      map.set(t.id, t.name);
    }
    return map;
  }, [templates]);

  const subtitle = useMemo(() => {
    if (projects.length === 0) return "Ready to create your first calendar?";
    const draftCount = projects.filter((p) => p.status === "draft").length;
    if (draftCount > 0) {
      return `You have ${draftCount} calendar${draftCount !== 1 ? "s" : ""} in progress`;
    }
    return `You have ${projects.length} calendar${projects.length !== 1 ? "s" : ""}`;
  }, [projects]);

  return (
    <div>
      {/* Header with greeting */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 font-[family-name:var(--font-heading)]">
            {getGreeting()}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-stone-500">{subtitle}</p>
        </div>
        <a
          href="/app/create"
          className="rounded-full bg-rose-500 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-rose-600 focus:ring-2 focus:ring-rose-300 focus:ring-offset-2"
        >
          Create Calendar
        </a>
      </div>

      {projects.length === 0 ? (
        /* Empty state */
        <div className="rounded-2xl border-2 border-dashed border-stone-200 bg-gradient-to-br from-rose-50 to-amber-50 px-6 py-16 text-center">
          {/* Calendar + heart illustration */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Calendar body */}
              <rect x="10" y="18" width="52" height="48" rx="6" fill="white" stroke="#d6d3d1" strokeWidth="2" />
              {/* Calendar top bar */}
              <rect x="10" y="18" width="52" height="14" rx="6" fill="#e7e5e4" />
              <rect x="10" y="26" width="52" height="6" fill="#e7e5e4" />
              {/* Calendar hooks */}
              <rect x="24" y="13" width="3" height="10" rx="1.5" fill="#a8a29e" />
              <rect x="45" y="13" width="3" height="10" rx="1.5" fill="#a8a29e" />
              {/* Calendar grid dots */}
              <circle cx="24" cy="40" r="2" fill="#d6d3d1" />
              <circle cx="36" cy="40" r="2" fill="#d6d3d1" />
              <circle cx="48" cy="40" r="2" fill="#d6d3d1" />
              <circle cx="24" cy="50" r="2" fill="#d6d3d1" />
              <circle cx="36" cy="50" r="2" fill="#d6d3d1" />
              <circle cx="48" cy="50" r="2" fill="#d6d3d1" />
              {/* Heart */}
              <path
                d="M58 42c0-4.5 6-8 9-4s3 8-9 14c-12-6-12-10-9-14s9-.5 9 4z"
                fill="#fb7185"
                opacity="0.9"
              />
              {/* Camera icon */}
              <rect x="50" y="56" width="22" height="16" rx="3" fill="#fbbf24" opacity="0.85" />
              <circle cx="61" cy="64" r="4" fill="white" opacity="0.9" />
              <rect x="57" y="54" width="8" height="4" rx="1" fill="#f59e0b" opacity="0.85" />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-stone-800 font-[family-name:var(--font-heading)]">
            Your calendar journey begins here
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">
            Create a personalised photo calendar — the perfect gift for family and friends.
          </p>

          <a
            href="/app/create"
            className="mt-6 inline-block rounded-full bg-rose-500 px-6 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-rose-600 focus:ring-2 focus:ring-rose-300 focus:ring-offset-2"
          >
            Create Your First Calendar
          </a>

          {/* Feature hints */}
          <div className="mx-auto mt-10 grid max-w-lg gap-4 sm:grid-cols-3">
            {/* 13 templates */}
            <div className="flex flex-col items-center gap-2 rounded-xl bg-white/60 px-4 py-4">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="10" height="10" rx="2" fill="#fecdd3" stroke="#e11d48" strokeWidth="1" opacity="0.7" />
                <rect x="16" y="2" width="10" height="10" rx="2" fill="#fef3c7" stroke="#d97706" strokeWidth="1" opacity="0.7" />
                <rect x="2" y="16" width="10" height="10" rx="2" fill="#fef3c7" stroke="#d97706" strokeWidth="1" opacity="0.7" />
                <rect x="16" y="16" width="10" height="10" rx="2" fill="#fecdd3" stroke="#e11d48" strokeWidth="1" opacity="0.7" />
              </svg>
              <span className="text-xs font-medium text-stone-700">13 templates</span>
            </div>

            {/* Print-ready */}
            <div className="flex flex-col items-center gap-2 rounded-xl bg-white/60 px-4 py-4">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="10" width="20" height="12" rx="2" fill="#fecdd3" stroke="#e11d48" strokeWidth="1" opacity="0.7" />
                <rect x="8" y="4" width="12" height="8" rx="1" fill="#fef3c7" stroke="#d97706" strokeWidth="1" opacity="0.7" />
                <rect x="8" y="20" width="12" height="6" rx="1" fill="white" stroke="#d6d3d1" strokeWidth="1" />
              </svg>
              <span className="text-xs font-medium text-stone-700">Print-ready</span>
            </div>

            {/* Delivered to your door */}
            <div className="flex flex-col items-center gap-2 rounded-xl bg-white/60 px-4 py-4">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="8" width="18" height="14" rx="2" fill="#fef3c7" stroke="#d97706" strokeWidth="1" opacity="0.7" />
                <path d="M20 12h4l2 4v6h-6V12z" fill="#fecdd3" stroke="#e11d48" strokeWidth="1" opacity="0.7" />
                <circle cx="8" cy="24" r="2.5" fill="#a8a29e" />
                <circle cx="22" cy="24" r="2.5" fill="#a8a29e" />
              </svg>
              <span className="text-xs font-medium text-stone-700">Delivered to your door</span>
            </div>
          </div>
        </div>
      ) : (
        /* Calendar cards grid */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const badge = STATUS_BADGE[project.status] || STATUS_BADGE.draft;
            const templateName = project.templateId
              ? templateMap.get(project.templateId)
              : null;

            return (
              <a
                key={project.id}
                href={`/app/calendars/${project.id}/edit`}
                className="group rounded-2xl bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                {/* Cover image or gradient placeholder */}
                {project.coverImageUrl ? (
                  <div className="mb-3 aspect-[4/3] overflow-hidden rounded-xl">
                    <img
                      src={project.coverImageUrl}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                    />
                  </div>
                ) : (
                  <div className="mb-3 aspect-[4/3] rounded-xl bg-gradient-to-br from-rose-50 to-amber-50" />
                )}

                {/* Title + status badge */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-stone-800 leading-snug">
                    {project.title}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${badge.bg} ${badge.text}`}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Meta row */}
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-stone-500">
                  <span>{project.calendarYear}</span>
                  <span aria-hidden="true">&middot;</span>
                  <span>{project.paperSize}</span>
                  {templateName && (
                    <>
                      <span aria-hidden="true">&middot;</span>
                      <span>{templateName}</span>
                    </>
                  )}
                </div>

                {/* Relative time */}
                <p className="mt-1.5 text-xs text-stone-400">
                  {getRelativeTime(project.updatedAt)}
                </p>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
