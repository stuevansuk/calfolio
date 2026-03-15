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
          <h1 className="text-2xl font-bold">My Calendars</h1>
          <p className="text-sm text-gray-500">
            {projects.length} calendar{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <a
          href="/app/create"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Create Calendar
        </a>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
          <h2 className="text-lg font-medium text-gray-900">
            No calendars yet
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Create your first photo calendar to get started.
          </p>
          <a
            href="/app/create"
            className="mt-4 inline-block rounded-lg bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800"
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
              className="rounded-lg border bg-white p-4 transition hover:shadow-md"
            >
              <div className="mb-3 aspect-[4/3] rounded bg-gray-100" />
              <h3 className="font-medium">{project.title}</h3>
              <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
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
