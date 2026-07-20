"use client";

import { useState, useCallback, useEffect } from "react";
import { DashboardHeader } from "@/components/analytics/dashboard-header";
import { FilterBar } from "@/components/analytics/filter-bar";
import { KpiCards } from "@/components/analytics/kpi-cards";
import { ChartsContainer } from "@/components/analytics/charts-container";
import { AiPlaceholders } from "@/components/analytics/ai-placeholders";
import type { AnalyticsFilterInput, DashboardPayload } from "@/schemas/analytics.schema";

export default function AnalyticsDashboardPage() {
  const [filters, setFilters] = useState<AnalyticsFilterInput>({ range: "30d" });
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.range) params.set("range", filters.range);
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);
      if (filters.channel) params.set("channel", filters.channel);
      if (filters.status) params.set("status", filters.status);
      if (filters.sentiment) params.set("sentiment", filters.sentiment);
      if (filters.themeId) params.set("themeId", filters.themeId);

      const res = await fetch(`/api/analytics/dashboard?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data) {
        setDashboard(json.data);
      }
    } catch {
      // Network-level failure — dashboard stays in previous state
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleFilterChange = (newFilters: AnalyticsFilterInput) => {
    setFilters(newFilters);
  };

  const handleReset = () => {
    setFilters({ range: "30d" });
  };

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-[1600px] mx-auto">
      <DashboardHeader
        meta={dashboard?.meta}
        isLoading={isLoading}
        onRefresh={fetchDashboard}
      />

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      <KpiCards
        data={dashboard?.overview}
        isLoading={isLoading}
        error={dashboard?.errors?.overview}
      />

      <ChartsContainer
        data={dashboard ?? undefined}
        isLoading={isLoading}
        filters={filters}
      />

      <AiPlaceholders data={dashboard?.aiPlaceholders} />
    </div>
  );
}
