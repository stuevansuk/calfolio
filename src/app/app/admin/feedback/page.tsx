"use client";

import { useEffect, useState, useCallback } from "react";
import type { ApiResponse, FeedbackItem, PaginatedResponse } from "@/types";

type FeedbackStatus = "open" | "planned" | "in_progress" | "done" | "closed";

const STATUS_OPTIONS: { value: FeedbackStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
  { value: "closed", label: "Closed" },
];

const STATUS_COLORS: Record<FeedbackStatus, string> = {
  open: "bg-gray-100 text-gray-700",
  planned: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  done: "bg-green-100 text-green-700",
  closed: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  open: "Open",
  planned: "Planned",
  in_progress: "In Progress",
  done: "Done",
  closed: "Closed",
};

const CATEGORY_COLORS: Record<string, string> = {
  feature: "bg-purple-100 text-purple-700",
  bug: "bg-red-100 text-red-700",
  improvement: "bg-blue-100 text-blue-700",
};

const ITEMS_PER_PAGE = 20;

function Spinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
    </div>
  );
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "all">(
    "all"
  );
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: String(ITEMS_PER_PAGE),
        offset: String(page * ITEMS_PER_PAGE),
      });
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      const res = await fetch(`/api/feedback?${params.toString()}`);
      if (res.status === 403) {
        setError("Access denied. Admin privileges required.");
        setLoading(false);
        return;
      }

      const data: ApiResponse<PaginatedResponse<FeedbackItem>> =
        await res.json();
      if (!data.success || !data.data) {
        setError(data.error || "Failed to load feedback");
        setLoading(false);
        return;
      }

      setItems(data.data.items);
      setTotal(data.data.total);
    } catch {
      setError("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  async function handleStatusChange(id: string, newStatus: FeedbackStatus) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data: ApiResponse<FeedbackItem> = await res.json();
      if (data.success && data.data) {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? data.data! : item))
        );
      }
    } catch {
      // silently fail, user can retry
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(id: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "DELETE",
      });

      const data: ApiResponse<undefined> = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        setTotal((prev) => prev - 1);
        setDeleteConfirmId(null);
        setExpandedId(null);
      }
    } catch {
      // silently fail, user can retry
    } finally {
      setUpdatingId(null);
    }
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  if (loading && items.length === 0) return <Spinner />;

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-lg font-medium text-red-800">{error}</p>
          <a
            href="/app"
            className="mt-4 inline-block text-sm text-red-600 underline"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Feedback Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            {formatNumber(total)} total item{total !== 1 ? "s" : ""}
          </p>
        </div>
        <a
          href="/app/admin/metrics"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          View Metrics
        </a>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => {
              setStatusFilter(value);
              setPage(0);
              setExpandedId(null);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === value
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Feedback List */}
      {items.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <p className="text-gray-500">No feedback items found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Table Header - hidden on mobile */}
          <div className="hidden rounded-lg bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500 sm:grid sm:grid-cols-12 sm:gap-4">
            <div className="col-span-4">Title</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-center">Votes</div>
            <div className="col-span-2 text-right">Created</div>
          </div>

          {items.map((item) => (
            <div key={item.id} className="rounded-lg border bg-white">
              {/* Row */}
              <button
                onClick={() =>
                  setExpandedId(expandedId === item.id ? null : item.id)
                }
                className="w-full px-4 py-3 text-left sm:grid sm:grid-cols-12 sm:items-center sm:gap-4"
              >
                <div className="col-span-4">
                  <p className="font-medium text-sm truncate">{item.title}</p>
                </div>
                <div className="col-span-2 mt-1 sm:mt-0">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      CATEGORY_COLORS[item.category] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.category}
                  </span>
                </div>
                <div className="col-span-2 mt-1 sm:mt-0">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      STATUS_COLORS[item.status]
                    }`}
                  >
                    {STATUS_LABELS[item.status]}
                  </span>
                </div>
                <div className="col-span-2 mt-1 text-sm text-gray-600 sm:mt-0 sm:text-center">
                  {item.voteCount}
                </div>
                <div className="col-span-2 mt-1 text-xs text-gray-400 sm:mt-0 sm:text-right">
                  {formatDate(item.createdAt)}
                </div>
              </button>

              {/* Expanded Detail */}
              {expandedId === item.id && (
                <div className="border-t px-4 py-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {item.description}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <label className="text-sm font-medium text-gray-500">
                      Status:
                    </label>
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(
                          item.id,
                          e.target.value as FeedbackStatus
                        )
                      }
                      disabled={updatingId === item.id}
                      className="rounded-lg border bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
                    >
                      <option value="open">Open</option>
                      <option value="planned">Planned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                      <option value="closed">Closed</option>
                    </select>

                    {deleteConfirmId === item.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-red-600">
                          Confirm delete?
                        </span>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={updatingId === item.id}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {updatingId === item.id ? "Deleting..." : "Yes, Delete"}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    )}

                    {updatingId === item.id && (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {page * ITEMS_PER_PAGE + 1}
            {" - "}
            {Math.min((page + 1) * ITEMS_PER_PAGE, total)} of{" "}
            {formatNumber(total)}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}
