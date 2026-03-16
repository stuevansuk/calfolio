"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAppStore } from "@/stores/app-store";
import type { CalendarProjectWithPages } from "@/types";

export default function CalendarEditorPage() {
  const params = useParams();
  const id = params.id as string;
  const { currentProject, setCurrentProject, updatePage } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/calendars/${id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setCurrentProject(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, [id, setCurrentProject]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-rose-500" />
      </div>
    );
  }

  if (!currentProject) {
    return <div className="py-20 text-center text-stone-500">Calendar not found</div>;
  }

  const pages = currentProject.pages || [];
  const pagesWithPhotos = pages.filter((p) => p.imageUrl).length;
  const totalPages = pages.length;
  const MONTH_NAMES = [
    "Cover",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm">
        <a href="/app" className="text-stone-400 hover:text-rose-500 transition-all duration-200">
          Dashboard
        </a>
        <span className="text-rose-300">/</span>
        <span className="text-stone-600">{currentProject.title}</span>
      </nav>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 font-[family-name:var(--font-heading)]">{currentProject.title}</h1>
          <p className="text-sm text-stone-500">
            {currentProject.calendarYear} &middot; {currentProject.paperSize}
          </p>
          {/* Progress indicator */}
          <div className="mt-2">
            <p className="mb-1 text-xs text-stone-500">
              {pagesWithPhotos} of {totalPages} pages have photos
            </p>
            <div className="h-1.5 w-48 overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-full rounded-full bg-rose-500 transition-all duration-200"
                style={{ width: totalPages > 0 ? `${(pagesWithPhotos / totalPages) * 100}%` : "0%" }}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href={`/app/calendars/${id}/order`}
            className="rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-all duration-200"
          >
            Order Print
          </a>
          <button className="rounded-full bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 transition-all duration-200">
            Download PDF
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Image upload sidebar */}
        <div className="rounded-2xl bg-stone-50 p-4 shadow-sm">
          <h2 className="mb-3 font-medium text-stone-800">Images</h2>
          <div className="mb-4 rounded-xl border-2 border-dashed border-rose-200 bg-rose-50/30 p-8 text-center">
            <svg className="mx-auto mb-2 h-8 w-8 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
            <p className="text-sm text-stone-500">
              Drag & drop images here
            </p>
            <label
              htmlFor="image-upload"
              className="mt-3 inline-block cursor-pointer rounded-full bg-rose-500 px-4 py-1.5 text-xs text-white hover:bg-rose-600 transition-all duration-200"
            >
              Browse files
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={() => {
                // TODO: Handle image upload via presigned URL
              }}
            />
          </div>
        </div>

        {/* Page grid */}
        <div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => setSelectedPageIndex(page.monthIndex)}
                className={`relative rounded-xl p-2 text-left shadow-sm transition-all duration-200 hover:shadow-md ${
                  selectedPageIndex === page.monthIndex
                    ? "ring-2 ring-rose-400 bg-white"
                    : "bg-white"
                }`}
              >
                <div
                  className="relative aspect-[3/4] rounded-lg bg-gradient-to-br from-rose-50 to-amber-50"
                  style={{
                    backgroundImage: page.imageUrl
                      ? `url(${page.imageUrl})`
                      : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {page.imageUrl ? (
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-400" />
                  ) : (
                    <svg className="absolute inset-0 m-auto h-6 w-6 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                    </svg>
                  )}
                </div>
                <p className="mt-1.5 text-center text-xs font-medium text-stone-600">
                  {MONTH_NAMES[page.monthIndex]}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
