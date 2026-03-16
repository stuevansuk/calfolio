"use client";

import { useEffect, useState } from "react";
import type { ApiResponse } from "@/types";

type OverviewMetrics = {
  totalUsers: number;
  totalProjects: number;
  totalOrders: number;
  tierBreakdown: {
    trial: number;
    hobby: number;
    pro: number;
    free: number;
  };
};

type ContentMetrics = {
  statusBreakdown: {
    draft: number;
    completed: number;
    ordered: number;
  };
  sizeBreakdown: {
    a4: number;
    a5: number;
  };
};

type EngagementMetrics = {
  activeLastWeek: number;
  activeLastMonth: number;
  newUsersLastWeek: number;
};

type RevenueMetrics = {
  printOrders: {
    totalOrders: number;
    totalRevenueCents: number;
    totalCostCents: number;
    marginCents: number;
  };
  subscribers: {
    hobby: number;
    pro: number;
  };
};

function formatCurrency(cents: number): string {
  return `\u00a3${(cents / 100).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function Spinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-rose-500" />
    </div>
  );
}

function StatCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-stone-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-stone-800">{value}</p>
      {subtitle && <p className="mt-1 text-sm text-stone-400">{subtitle}</p>}
    </div>
  );
}

export default function AdminMetricsPage() {
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [content, setContent] = useState<ContentMetrics | null>(null);
  const [engagement, setEngagement] = useState<EngagementMetrics | null>(null);
  const [revenue, setRevenue] = useState<RevenueMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const [overviewRes, contentRes, engagementRes, revenueRes] =
          await Promise.all([
            fetch("/api/admin/metrics"),
            fetch("/api/admin/metrics/content"),
            fetch("/api/admin/metrics/engagement"),
            fetch("/api/admin/metrics/revenue"),
          ]);

        if (overviewRes.status === 403) {
          setError("Access denied. Admin privileges required.");
          setLoading(false);
          return;
        }

        const overviewData: ApiResponse<OverviewMetrics> =
          await overviewRes.json();
        const contentData: ApiResponse<ContentMetrics> =
          await contentRes.json();
        const engagementData: ApiResponse<EngagementMetrics> =
          await engagementRes.json();
        const revenueData: ApiResponse<RevenueMetrics> =
          await revenueRes.json();

        if (!overviewData.success) {
          setError(overviewData.error || "Failed to load metrics");
          setLoading(false);
          return;
        }

        if (overviewData.data) setOverview(overviewData.data);
        if (contentData.data) setContent(contentData.data);
        if (engagementData.data) setEngagement(engagementData.data);
        if (revenueData.data) setRevenue(revenueData.data);
      } catch {
        setError("Failed to load metrics");
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  if (loading) return <Spinner />;

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
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

  const totalProjects =
    content
      ? Number(content.statusBreakdown.draft) +
        Number(content.statusBreakdown.completed) +
        Number(content.statusBreakdown.ordered)
      : 0;

  const marginPercent =
    revenue && revenue.printOrders.totalRevenueCents > 0
      ? (
          (revenue.printOrders.marginCents /
            revenue.printOrders.totalRevenueCents) *
          100
        ).toFixed(1)
      : "0";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 font-[family-name:var(--font-heading)]">Admin Metrics</h1>
          <p className="mt-1 text-sm text-stone-500">
            Platform overview and analytics
          </p>
        </div>
        <a
          href="/app/admin/feedback"
          className="rounded-full bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 focus:ring-2 focus:ring-rose-300 focus:ring-offset-2"
        >
          Manage Feedback
        </a>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={formatNumber(overview?.totalUsers ?? 0)}
        />
        <StatCard
          label="Total Projects"
          value={formatNumber(overview?.totalProjects ?? 0)}
        />
        <StatCard
          label="Total Orders"
          value={formatNumber(overview?.totalOrders ?? 0)}
        />
        <StatCard
          label="Active This Week"
          value={formatNumber(engagement?.activeLastWeek ?? 0)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* Tier Breakdown */}
        {overview && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-800">Tier Breakdown</h2>
            <div className="mt-4 space-y-3">
              {(
                [
                  { key: "trial" as const, label: "Trial", color: "bg-amber-400" },
                  { key: "hobby" as const, label: "Hobby", color: "bg-rose-400" },
                  { key: "pro" as const, label: "Pro", color: "bg-emerald-400" },
                  { key: "free" as const, label: "Free", color: "bg-stone-400" },
                ] as const
              ).map(({ key, label, color }) => {
                const count = Number(overview.tierBreakdown[key]) || 0;
                const total = overview.totalUsers || 1;
                const pct = ((count / total) * 100).toFixed(1);
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-stone-700">{label}</span>
                      <span className="text-stone-500">
                        {formatNumber(count)} ({pct}%)
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-stone-100">
                      <div
                        className={`h-full rounded-full ${color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Content Stats */}
        {content && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-800">Content Stats</h2>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-stone-500">
                  Project Status
                </h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-stone-400" />
                      Draft
                    </span>
                    <span className="font-medium text-stone-800">
                      {formatNumber(Number(content.statusBreakdown.draft))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                      Completed
                    </span>
                    <span className="font-medium text-stone-800">
                      {formatNumber(Number(content.statusBreakdown.completed))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-rose-400" />
                      Ordered
                    </span>
                    <span className="font-medium text-stone-800">
                      {formatNumber(Number(content.statusBreakdown.ordered))}
                    </span>
                  </div>
                </div>
              </div>
              <div className="border-t border-stone-100 pt-4">
                <h3 className="text-sm font-medium text-stone-500">
                  Paper Size
                </h3>
                <div className="mt-2 flex gap-4">
                  <div className="flex-1 rounded-xl bg-stone-50 p-3 text-center">
                    <p className="text-2xl font-bold text-stone-800">
                      {formatNumber(Number(content.sizeBreakdown.a4))}
                    </p>
                    <p className="text-xs text-stone-500">A4</p>
                  </div>
                  <div className="flex-1 rounded-xl bg-stone-50 p-3 text-center">
                    <p className="text-2xl font-bold text-stone-800">
                      {formatNumber(Number(content.sizeBreakdown.a5))}
                    </p>
                    <p className="text-xs text-stone-500">A5</p>
                  </div>
                </div>
                {totalProjects > 0 && (
                  <p className="mt-2 text-xs text-stone-400 text-center">
                    {formatNumber(totalProjects)} total projects
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Revenue */}
        {revenue && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-800">Revenue</h2>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-stone-500">
                  Print Orders
                </h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-600">Total Revenue</span>
                    <span className="font-medium text-stone-800">
                      {formatCurrency(revenue.printOrders.totalRevenueCents)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-600">Total Cost</span>
                    <span className="font-medium text-stone-500">
                      {formatCurrency(revenue.printOrders.totalCostCents)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-stone-100 pt-2 text-sm">
                    <span className="font-medium text-stone-700">Margin</span>
                    <span className="font-bold text-emerald-600">
                      {formatCurrency(revenue.printOrders.marginCents)} (
                      {marginPercent}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-600">Paid Orders</span>
                    <span className="font-medium text-stone-800">
                      {formatNumber(revenue.printOrders.totalOrders)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="border-t border-stone-100 pt-4">
                <h3 className="text-sm font-medium text-stone-500">
                  Subscribers
                </h3>
                <div className="mt-2 flex gap-4">
                  <div className="flex-1 rounded-xl bg-rose-50 p-3 text-center">
                    <p className="text-2xl font-bold text-rose-700">
                      {formatNumber(Number(revenue.subscribers.hobby))}
                    </p>
                    <p className="text-xs text-rose-500">Hobby</p>
                  </div>
                  <div className="flex-1 rounded-xl bg-emerald-50 p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-700">
                      {formatNumber(Number(revenue.subscribers.pro))}
                    </p>
                    <p className="text-xs text-emerald-500">Pro</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Engagement */}
        {engagement && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-800">Engagement</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-stone-50 p-3">
                <span className="text-sm text-stone-600">Active Last Week</span>
                <span className="text-xl font-bold text-stone-800">
                  {formatNumber(engagement.activeLastWeek)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-stone-50 p-3">
                <span className="text-sm text-stone-600">
                  Active Last Month
                </span>
                <span className="text-xl font-bold text-stone-800">
                  {formatNumber(engagement.activeLastMonth)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-stone-50 p-3">
                <span className="text-sm text-stone-600">
                  New Users Last Week
                </span>
                <span className="text-xl font-bold text-stone-800">
                  {formatNumber(engagement.newUsersLastWeek)}
                </span>
              </div>
              {overview && overview.totalUsers > 0 && (
                <p className="text-xs text-stone-400 text-center">
                  {(
                    (engagement.activeLastMonth / overview.totalUsers) *
                    100
                  ).toFixed(1)}
                  % monthly active rate
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
