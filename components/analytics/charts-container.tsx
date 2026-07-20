"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Button } from "@/components/ui/button";
import { ChartCard } from "./chart-card";
import type { DashboardPayload, AnalyticsFilterInput } from "@/schemas/analytics.schema";

interface ChartsContainerProps {
  data: DashboardPayload | undefined;
  isLoading: boolean;
  filters: AnalyticsFilterInput;
}

const SENTIMENT_COLORS: Record<string, string> = {
  POSITIVE: "#10b981",
  NEUTRAL: "#f59e0b",
  NEGATIVE: "#ef4444",
};

const CHANNEL_COLORS: Record<string, string> = {
  EMAIL: "#3b82f6",
  SURVEY: "#8b5cf6",
  APP_STORE: "#06b6d4",
  PLAY_STORE: "#10b981",
  SUPPORT: "#f59e0b",
  SOCIAL: "#ec4899",
  SALES: "#6366f1",
  OTHER: "#64748b",
};

const STATUS_COLORS: Record<string, string> = {
  NEW: "#3b82f6",
  REVIEWED: "#a855f7",
  ACTIONED: "#10b981",
};

export function ChartsContainer({ data, isLoading, filters }: ChartsContainerProps) {
  const router = useRouter();
  const [trendGranularity, setTrendGranularity] = useState<"daily" | "weekly" | "monthly">("daily");

  const buildDrillDownUrl = (extraParams: Record<string, string>) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(extraParams)) {
      params.set(k, v);
    }
    if (filters.channel) params.set("channel", filters.channel);
    if (filters.status) params.set("status", filters.status);
    if (filters.sentiment) params.set("sentiment", filters.sentiment);
    if (filters.themeId) params.set("themeId", filters.themeId);
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);
    return `/feedback?${params.toString()}`;
  };

  const activeTrends = data?.trends ? data.trends[trendGranularity] : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. Volume Over Time */}
        <ChartCard
          title="Feedback Volume Over Time"
          subtitle="Trend analysis of customer feedback velocity"
          isLoading={isLoading}
          error={data?.errors?.trends}
          legend={
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground font-semibold">Granularity:</span>
                <div className="flex bg-muted p-0.5 rounded-md border">
                  {(["daily", "weekly", "monthly"] as const).map((g) => (
                    <Button
                      key={g}
                      variant="ghost"
                      size="sm"
                      onClick={() => setTrendGranularity(g)}
                      className={`h-5 text-[10px] px-2 capitalize font-semibold ${
                        trendGranularity === g ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                      }`}
                    >
                      {g}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Pos
                </span>
                <span className="flex items-center gap-1 text-amber-500 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Neu
                </span>
                <span className="flex items-center gap-1 text-rose-500 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-rose-500" /> Neg
                </span>
              </div>
            </div>
          }
        >
          {activeTrends.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">
              No trend data recorded for selected date range.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                  itemStyle={{ color: "#f8fafc" }}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" name="Total Feedback" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* 2. Sentiment Distribution */}
        <ChartCard
          title="Sentiment Distribution"
          subtitle="Proportion of Positive, Neutral, and Negative customer sentiment"
          isLoading={isLoading}
          error={data?.errors?.sentiment}
          legend={
            <div className="flex items-center justify-center gap-4 text-xs font-semibold">
              {(data?.sentiment || []).map((s) => (
                <button
                  key={s.sentiment}
                  onClick={() => router.push(buildDrillDownUrl({ sentiment: s.sentiment }) as Parameters<typeof router.push>[0])}
                  className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: SENTIMENT_COLORS[s.sentiment] || "#94a3b8" }}
                  />
                  <span className="text-foreground">{s.label}:</span>
                  <span className="text-muted-foreground">{s.count} ({s.percentage}%)</span>
                </button>
              ))}
            </div>
          }
        >
          {(!data?.sentiment || data.sentiment.length === 0) ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">
              No sentiment metrics available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.sentiment}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  className="cursor-pointer"
                >
                  {data.sentiment.map((entry) => (
                    <Cell key={entry.sentiment} fill={SENTIMENT_COLORS[entry.sentiment] || "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 3. Feedback by Channel */}
        <ChartCard
          title="Feedback by Channel"
          subtitle="Volume distribution across customer communication touchpoints"
          isLoading={isLoading}
          error={data?.errors?.channels}
        >
          {(!data?.channels || data.channels.length === 0) ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">
              No channel metrics available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.channels} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar
                  dataKey="count"
                  name="Volume"
                  radius={[4, 4, 0, 0]}
                  className="cursor-pointer"
                >
                  {data.channels.map((entry) => (
                    <Cell key={entry.channel} fill={CHANNEL_COLORS[entry.channel] || "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* 4. Status Workflow Distribution */}
        <ChartCard
          title="Workflow Status Breakdown"
          subtitle="Progress distribution across NEW, REVIEWED, and ACTIONED statuses"
          isLoading={isLoading}
          error={data?.errors?.status}
        >
          {(!data?.status || data.status.length === 0) ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic">
              No status distribution available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={data.status} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} />
                <YAxis dataKey="label" type="category" tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                />
                <Bar
                  dataKey="count"
                  name="Volume"
                  radius={[0, 4, 4, 0]}
                  className="cursor-pointer"
                >
                  {data.status.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* 5. Top 10 Themes */}
      <ChartCard
        title="Top 10 Categorized Themes"
        subtitle="Most frequent recurring customer feedback topics"
        isLoading={isLoading}
        error={data?.errors?.topThemes}
        heightClassName="h-64"
      >
        {(!data?.topThemes || data.topThemes.length === 0) ? (
          <div className="h-full flex flex-col items-center justify-center text-xs text-muted-foreground space-y-1">
            <span className="italic">No active themes recorded yet.</span>
            <span className="text-[11px] text-muted-foreground/80">Themes will appear once feedback items are assigned to themes.</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.topThemes} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="themeName" tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} interval={0} angle={-15} textAnchor="end" />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
              />
              <Bar
                dataKey="count"
                fill="#14b8a6"
                name="Feedback Items"
                radius={[4, 4, 0, 0]}
                className="cursor-pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
