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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 font-[family-name:var(--font-heading)]">{currentProject.title}</h1>
          <p className="text-sm text-stone-500">
            {currentProject.calendarYear} &middot; {currentProject.paperSize}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/app/calendars/${id}/order`}
            className="rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
          >
            Order Print
          </a>
          <button className="rounded-full bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 focus:ring-2 focus:ring-rose-300 focus:ring-offset-2">
            Download PDF
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Image upload sidebar */}
        <div className="rounded-2xl bg-stone-50 p-4 shadow-sm">
          <h2 className="mb-3 font-medium text-stone-800">Images</h2>
          <div className="mb-4 rounded-xl border-2 border-dashed border-rose-200 bg-rose-50/30 p-8 text-center">
            <p className="text-sm text-stone-500">
              Drag & drop images here or click to upload
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              className="mt-2 text-sm"
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
                className={`rounded-xl p-2 text-left shadow-sm transition hover:shadow-md ${
                  selectedPageIndex === page.monthIndex
                    ? "ring-2 ring-rose-400 bg-white"
                    : "bg-white"
                }`}
              >
                <div
                  className="aspect-[3/4] rounded-lg bg-gradient-to-br from-rose-50 to-amber-50"
                  style={{
                    backgroundImage: page.imageUrl
                      ? `url(${page.imageUrl})`
                      : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
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
