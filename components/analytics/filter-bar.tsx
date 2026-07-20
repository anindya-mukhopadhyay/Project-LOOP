"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, X, Calendar } from "lucide-react";
import { Channel, FeedbackStatus, Sentiment } from "@prisma/client";
import type { AnalyticsFilterInput } from "@/schemas/analytics.schema";

interface ThemeOption {
  id: string;
  name: string;
}

interface FilterBarProps {
  filters: AnalyticsFilterInput;
  onFilterChange: (newFilters: AnalyticsFilterInput) => void;
  onReset: () => void;
}

export function FilterBar({ filters, onFilterChange, onReset }: FilterBarProps) {
  const [themes, setThemes] = useState<ThemeOption[]>([]);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const res = await fetch("/api/themes");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setThemes(json.data);
        }
      } catch {
        // Silently fallback if themes endpoint fails
      }
    };
    fetchThemes();
  }, []);

  const hasActiveFilters =
    filters.range !== "30d" ||
    !!filters.channel ||
    !!filters.status ||
    !!filters.sentiment ||
    !!filters.themeId ||
    !!filters.startDate ||
    !!filters.endDate;

  return (
    <div className="bg-card/50 border border-border/60 rounded-xl p-3 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-semibold text-foreground/80">
        <div className="flex items-center gap-1.5 text-foreground">
          <Filter className="h-3.5 w-3.5 text-primary" />
          <span>Dashboard Filters</span>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive gap-1"
          >
            <X className="h-3 w-3" /> Clear Filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {/* Date Range Selector */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Date Range</label>
          <select
            value={filters.range || "30d"}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                range: e.target.value as AnalyticsFilterInput["range"],
              })
            }
            className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {/* Channel Selector */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Channel</label>
          <select
            value={filters.channel || ""}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                channel: e.target.value ? (e.target.value as Channel) : undefined,
              })
            }
            className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">All Channels</option>
            {Object.keys(Channel).map((c) => (
              <option key={c} value={c}>
                {c === "SOCIAL" ? "SOCIAL_MEDIA" : c}
              </option>
            ))}
          </select>
        </div>

        {/* Status Selector */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Status</label>
          <select
            value={filters.status || ""}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                status: e.target.value ? (e.target.value as FeedbackStatus) : undefined,
              })
            }
            className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">All Statuses</option>
            {Object.keys(FeedbackStatus).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Sentiment Selector */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Sentiment</label>
          <select
            value={filters.sentiment || ""}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                sentiment: e.target.value ? (e.target.value as Sentiment) : undefined,
              })
            }
            className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">All Sentiments</option>
            {Object.keys(Sentiment).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Theme Selector */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Theme</label>
          <select
            value={filters.themeId || ""}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                themeId: e.target.value ? e.target.value : undefined,
              })
            }
            className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">All Themes</option>
            {themes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filters.range === "custom" && (
        <div className="flex items-center gap-2 pt-1">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="date"
            value={filters.startDate ? filters.startDate.split("T")[0] : ""}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined,
              })
            }
            className="h-8 text-xs w-36"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <Input
            type="date"
            value={filters.endDate ? filters.endDate.split("T")[0] : ""}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined,
              })
            }
            className="h-8 text-xs w-36"
          />
        </div>
      )}
    </div>
  );
}
