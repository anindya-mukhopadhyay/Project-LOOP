"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Download, Clock } from "lucide-react";
import type { DashboardMetadata } from "@/schemas/analytics.schema";

interface DashboardHeaderProps {
  meta: DashboardMetadata | undefined;
  isLoading: boolean;
  onRefresh: () => void;
}

export function DashboardHeader({ meta, isLoading, onRefresh }: DashboardHeaderProps) {
  const formatTime = (isoString?: string) => {
    if (!isoString) return "Just now";
    return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics & Intelligence</h1>
          <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-xs">
            v1.0
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Real-time metrics, growth trends, channel distributions, and customer feedback insights.
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {meta?.health && (
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-md border border-border/40">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>Gen: {meta.health.generationTimeMs}ms</span>
            <span>•</span>
            <span className="text-emerald-500 font-semibold">{meta.health.dataFreshness}</span>
          </div>
        )}

        {meta?.lastUpdated && (
          <div className="text-xs text-muted-foreground font-medium">
            Updated: <span className="text-foreground">{formatTime(meta.lastUpdated)}</span>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-8 gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled
          title="Export feature ready for Phase 10 Voice of Customer Reports"
          className="h-8 gap-1.5 text-xs font-semibold opacity-70 cursor-not-allowed"
        >
          <Download className="h-3.5 w-3.5 text-muted-foreground" />
          Export (Phase 10)
        </Button>
      </div>
    </div>
  );
}
