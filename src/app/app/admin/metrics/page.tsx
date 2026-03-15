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
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
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
    <div className="rounded-lg border bg-white p-6">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
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

  const totalProjects =
    content
      ? content.statusBreakdown.draft +
        content.statusBreakdown.completed +
        content.statusBreakdown.ordered
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
          <h1 className="text-2xl font-bold">Admin Metrics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Platform overview and analytics
          </p>
        </div>
        <a
          href="/app/admin/feedback"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
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
          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold">Tier Breakdown</h2>
            <div className="mt-4 space-y-3">
              {(
                [
                  { key: "trial" as const, label: "Trial", color: "bg-yellow-400" },
                  { key: "hobby" as const, label: "Hobby", color: "bg-blue-400" },
                  { key: "pro" as const, label: "Pro", color: "bg-green-400" },
                  { key: "free" as const, label: "Free", color: "bg-gray-400" },
                ] as const
              ).map(({ key, label, color }) => {
                const count = Number(overview.tierBreakdown[key]) || 0;
                const total = overview.totalUsers || 1;
                const pct = ((count / total) * 100).toFixed(1);
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{label}</span>
                      <span className="text-gray-500">
                        {formatNumber(count)} ({pct}%)
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
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
          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold">Content Stats</h2>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Project Status
                </h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-gray-400" />
                      Draft
                    </span>
                    <span className="font-medium">
                      {formatNumber(Number(content.statusBreakdown.draft))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
                      Completed
                    </span>
                    <span className="font-medium">
                      {formatNumber(Number(content.statusBreakdown.completed))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
                      Ordered
                    </span>
                    <span className="font-medium">
                      {formatNumber(Number(content.statusBreakdown.ordered))}
                    </span>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-500">
                  Paper Size
                </h3>
                <div className="mt-2 flex gap-4">
                  <div className="flex-1 rounded-lg bg-gray-50 p-3 text-center">
                    <p className="text-2xl font-bold">
                      {formatNumber(Number(content.sizeBreakdown.a4))}
                    </p>
                    <p className="text-xs text-gray-500">A4</p>
                  </div>
                  <div className="flex-1 rounded-lg bg-gray-50 p-3 text-center">
                    <p className="text-2xl font-bold">
                      {formatNumber(Number(content.sizeBreakdown.a5))}
                    </p>
                    <p className="text-xs text-gray-500">A5</p>
                  </div>
                </div>
                {totalProjects > 0 && (
                  <p className="mt-2 text-xs text-gray-400 text-center">
                    {formatNumber(totalProjects)} total projects
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Revenue */}
        {revenue && (
          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold">Revenue</h2>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Print Orders
                </h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Total Revenue</span>
                    <span className="font-medium">
                      {formatCurrency(revenue.printOrders.totalRevenueCents)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Total Cost</span>
                    <span className="font-medium text-gray-500">
                      {formatCurrency(revenue.printOrders.totalCostCents)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2 text-sm">
                    <span className="font-medium">Margin</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(revenue.printOrders.marginCents)} (
                      {marginPercent}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Paid Orders</span>
                    <span className="font-medium">
                      {formatNumber(revenue.printOrders.totalOrders)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-500">
                  Subscribers
                </h3>
                <div className="mt-2 flex gap-4">
                  <div className="flex-1 rounded-lg bg-blue-50 p-3 text-center">
                    <p className="text-2xl font-bold text-blue-700">
                      {formatNumber(Number(revenue.subscribers.hobby))}
                    </p>
                    <p className="text-xs text-blue-500">Hobby</p>
                  </div>
                  <div className="flex-1 rounded-lg bg-green-50 p-3 text-center">
                    <p className="text-2xl font-bold text-green-700">
                      {formatNumber(Number(revenue.subscribers.pro))}
                    </p>
                    <p className="text-xs text-green-500">Pro</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Engagement */}
        {engagement && (
          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold">Engagement</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <span className="text-sm text-gray-600">Active Last Week</span>
                <span className="text-xl font-bold">
                  {formatNumber(engagement.activeLastWeek)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <span className="text-sm text-gray-600">
                  Active Last Month
                </span>
                <span className="text-xl font-bold">
                  {formatNumber(engagement.activeLastMonth)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <span className="text-sm text-gray-600">
                  New Users Last Week
                </span>
                <span className="text-xl font-bold">
                  {formatNumber(engagement.newUsersLastWeek)}
                </span>
              </div>
              {overview && overview.totalUsers > 0 && (
                <p className="text-xs text-gray-400 text-center">
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
