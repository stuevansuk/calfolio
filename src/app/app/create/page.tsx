"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/app-store";
import type { CalendarTemplate, TemplateConfig } from "@/types";
import { TemplatePreview } from "@/components/calendar/TemplatePreview";

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
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${step >= 1 ? "bg-rose-500 text-white" : "bg-stone-200 text-stone-500"}`}
        >
          1
        </div>
        <div className="h-px flex-1 bg-stone-200" />
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${step >= 2 ? "bg-rose-500 text-white" : "bg-stone-200 text-stone-500"}`}
        >
          2
        </div>
      </div>

      {step === 1 && (
        <div>
          <h1 className="mb-2 text-2xl font-bold text-stone-800 font-[family-name:var(--font-heading)]">Choose a Template</h1>
          <p className="mb-6 text-sm text-stone-500">
            Select a style for your calendar
          </p>

          <div className="mb-6 flex gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${
                  category === cat
                    ? "bg-rose-50 text-rose-700"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((template) => {
              const config = template.config as TemplateConfig;
              return (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template.id);
                    setStep(2);
                  }}
                  className={`rounded-2xl p-4 text-left shadow-sm transition hover:shadow-md ${
                    selectedTemplate === template.id
                      ? "ring-2 ring-rose-400 bg-white"
                      : "bg-white"
                  }`}
                >
                  <div className="mb-3 overflow-hidden rounded-xl border border-stone-100">
                    <TemplatePreview config={config} className="w-full" />
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-stone-800">{template.name}</h3>
                    {template.isPremium && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        Pro
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-stone-500">
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
            className="mb-4 text-sm text-stone-500 hover:text-rose-600"
          >
            &larr; Back to templates
          </button>
          <h1 className="mb-6 text-2xl font-bold text-stone-800 font-[family-name:var(--font-heading)]">Configure Your Calendar</h1>

          <div className="max-w-md space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Calendar 2027"
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-rose-300 focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={2020}
                max={2100}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-rose-300 focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">
                Start Month
              </label>
              <select
                value={startMonth}
                onChange={(e) => setStartMonth(Number(e.target.value))}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-rose-300 focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 focus:outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i).toLocaleString("en", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">
                Paper Size
              </label>
              <div className="flex gap-3">
                {(["A4", "A5"] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setPaperSize(size)}
                    className={`rounded-full border px-6 py-2 text-sm font-medium ${
                      paperSize === size
                        ? "border-rose-500 bg-rose-500 text-white"
                        : "border-stone-200 text-stone-600 hover:bg-stone-50"
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
              className="mt-6 w-full rounded-full bg-rose-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-600 disabled:opacity-50 focus:ring-2 focus:ring-rose-300 focus:ring-offset-2"
            >
              {creating ? "Creating..." : "Create Calendar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
