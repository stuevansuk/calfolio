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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
      </div>
    );
  }

  if (!currentProject) {
    return <div className="py-20 text-center text-gray-500">Calendar not found</div>;
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
          <h1 className="text-2xl font-bold">{currentProject.title}</h1>
          <p className="text-sm text-gray-500">
            {currentProject.calendarYear} &middot; {currentProject.paperSize}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/app/calendars/${id}/order`}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Order Print
          </a>
          <button className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
            Download PDF
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Image upload sidebar */}
        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 font-medium">Images</h2>
          <div className="mb-4 rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-500">
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
                className={`rounded-lg border p-2 text-left transition hover:shadow-md ${
                  selectedPageIndex === page.monthIndex
                    ? "border-black ring-2 ring-black"
                    : "border-gray-200"
                }`}
              >
                <div
                  className="aspect-[3/4] rounded bg-gray-100"
                  style={{
                    backgroundImage: page.imageUrl
                      ? `url(${page.imageUrl})`
                      : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <p className="mt-1.5 text-center text-xs font-medium">
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
