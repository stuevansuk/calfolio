"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/app-store";
import type { CalendarTemplate } from "@/types";

const CATEGORIES = ["all", "minimal", "classic", "modern", "artistic"] as const;

export default function CreateCalendarPage() {
  const router = useRouter();
  const { templates, setTemplates, addProject } = useAppStore();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("all");
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState(new Date().getFullYear() + 1);
  const [startMonth, setStartMonth] = useState(1);
  const [paperSize, setPaperSize] = useState<"A4" | "A5">("A4");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (templates.length === 0) {
      fetch("/api/templates")
        .then((r) => r.json())
        .then((res) => {
          if (res.success) setTemplates(res.data);
        });
    }
  }, [templates.length, setTemplates]);

  const filtered =
    category === "all"
      ? templates
      : templates.filter((t) => t.category === category);

  async function handleCreate() {
    setCreating(true);
    try {
      const res = await fetch("/api/calendars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "Untitled Calendar",
          templateId: selectedTemplate,
          calendarYear: year,
          startMonth,
          paperSize,
        }),
      });
      const data = await res.json();
      if (data.success) {
        addProject(data.data);
        router.push(`/app/calendars/${data.data.id}/edit`);
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Progress */}
      <div className="mb-8 flex items-center gap-4">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${step >= 1 ? "bg-black text-white" : "bg-gray-200"}`}
        >
          1
        </div>
        <div className="h-px flex-1 bg-gray-200" />
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${step >= 2 ? "bg-black text-white" : "bg-gray-200"}`}
        >
          2
        </div>
      </div>

      {step === 1 && (
        <div>
          <h1 className="mb-2 text-2xl font-bold">Choose a Template</h1>
          <p className="mb-6 text-sm text-gray-500">
            Select a style for your calendar
          </p>

          <div className="mb-6 flex gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${
                  category === cat
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((template) => {
              const config = template.config as { colors?: { background?: string } };
              return (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template.id);
                    setStep(2);
                  }}
                  className={`rounded-lg border p-4 text-left transition hover:shadow-md ${
                    selectedTemplate === template.id
                      ? "border-black ring-2 ring-black"
                      : "border-gray-200"
                  }`}
                >
                  <div
                    className="mb-3 aspect-[3/4] rounded"
                    style={{
                      backgroundColor: config?.colors?.background || "#f5f5f5",
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{template.name}</h3>
                    {template.isPremium && (
                      <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                        Pro
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {template.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <button
            onClick={() => setStep(1)}
            className="mb-4 text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; Back to templates
          </button>
          <h1 className="mb-6 text-2xl font-bold">Configure Your Calendar</h1>

          <div className="max-w-md space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Calendar 2027"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={2020}
                max={2100}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Start Month
              </label>
              <select
                value={startMonth}
                onChange={(e) => setStartMonth(Number(e.target.value))}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i).toLocaleString("en", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Paper Size
              </label>
              <div className="flex gap-3">
                {(["A4", "A5"] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setPaperSize(size)}
                    className={`rounded-lg border px-6 py-2 text-sm font-medium ${
                      paperSize === size
                        ? "border-black bg-black text-white"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="mt-6 w-full rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Calendar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
