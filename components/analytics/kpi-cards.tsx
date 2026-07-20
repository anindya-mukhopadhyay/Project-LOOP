"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, MessageSquare, CheckCircle, Clock, Smile, Users, Layers, AlertCircle } from "lucide-react";
import type { DashboardOverview, GrowthComparison } from "@/schemas/analytics.schema";

interface KpiCardsProps {
  data: DashboardOverview | undefined;
  isLoading: boolean;
  error: string | undefined;
}

export function KpiCards({ data, isLoading, error }: KpiCardsProps) {
  if (error) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-4 flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Unable to load KPI Overview metrics</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="bg-card/60">
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const renderGrowthBadge = (growth: GrowthComparison) => {
    const isUp = growth.direction === "up";
    const isDown = growth.direction === "down";

    return (
      <div className="flex items-center gap-1 text-[11px] font-semibold">
        {isUp && (
          <span className="text-emerald-500 flex items-center gap-0.5">
            <TrendingUp className="h-3 w-3" />+{growth.deltaPercentage}%
          </span>
        )}
        {isDown && (
          <span className="text-rose-500 flex items-center gap-0.5">
            <TrendingDown className="h-3 w-3" />
            {growth.deltaPercentage}%
          </span>
        )}
        {!isUp && !isDown && (
          <span className="text-muted-foreground flex items-center gap-0.5">
            <Minus className="h-3 w-3" />
            0.0%
          </span>
        )}
        <span className="text-muted-foreground text-[10px]">vs previous period</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. Total Feedback */}
      <Card className="bg-card/70 backdrop-blur-sm border-border/60 hover:border-border transition duration-150">
        <CardContent className="p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Total Feedback</span>
            <MessageSquare className="h-4 w-4 text-primary opacity-80" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {data.totalFeedback.currentValue.toLocaleString()}
          </div>
          {renderGrowthBadge(data.totalFeedback)}
        </CardContent>
      </Card>

      {/* 2. New Today & This Week */}
      <Card className="bg-card/70 backdrop-blur-sm border-border/60 hover:border-border transition duration-150">
        <CardContent className="p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>New Feedback Ingested</span>
            <Clock className="h-4 w-4 text-blue-500 opacity-80" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{data.newFeedbackToday}</span>
            <span className="text-xs text-muted-foreground font-semibold">Today</span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">{data.newFeedbackThisWeek}</span> received this week
          </div>
        </CardContent>
      </Card>

      {/* 3. Reviewed Feedback */}
      <Card className="bg-card/70 backdrop-blur-sm border-border/60 hover:border-border transition duration-150">
        <CardContent className="p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Reviewed Feedback</span>
            <CheckCircle className="h-4 w-4 text-purple-500 opacity-80" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {data.reviewedFeedback.currentValue.toLocaleString()}
          </div>
          {renderGrowthBadge(data.reviewedFeedback)}
        </CardContent>
      </Card>

      {/* 4. Actioned Feedback */}
      <Card className="bg-card/70 backdrop-blur-sm border-border/60 hover:border-border transition duration-150">
        <CardContent className="p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Actioned Feedback</span>
            <CheckCircle className="h-4 w-4 text-emerald-500 opacity-80" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {data.actionedFeedback.currentValue.toLocaleString()}
          </div>
          {renderGrowthBadge(data.actionedFeedback)}
        </CardContent>
      </Card>

      {/* 5. Average Sentiment Score */}
      <Card className="bg-card/70 backdrop-blur-sm border-border/60 hover:border-border transition duration-150">
        <CardContent className="p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Avg Sentiment Score</span>
            <Smile className="h-4 w-4 text-amber-500 opacity-80" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">
              {data.avgSentimentScore.currentValue > 0 ? `+${data.avgSentimentScore.currentValue}` : data.avgSentimentScore.currentValue}
            </span>
            <Badge
              variant="outline"
              className={
                data.avgSentimentScore.currentValue > 0.2
                  ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5 text-[10px]"
                  : data.avgSentimentScore.currentValue < -0.2
                  ? "border-rose-500/20 text-rose-500 bg-rose-500/5 text-[10px]"
                  : "border-amber-500/20 text-amber-500 bg-amber-500/5 text-[10px]"
              }
            >
              {data.avgSentimentScore.currentValue > 0.2 ? "Positive" : data.avgSentimentScore.currentValue < -0.2 ? "Negative" : "Neutral"}
            </Badge>
          </div>
          {renderGrowthBadge(data.avgSentimentScore)}
        </CardContent>
      </Card>

      {/* 6. Sentiment Breakdown */}
      <Card className="bg-card/70 backdrop-blur-sm border-border/60 hover:border-border transition duration-150">
        <CardContent className="p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Sentiment Breakdown</span>
            <span className="text-[10px] text-muted-foreground">% Share</span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-emerald-500 font-bold">{data.positivePercentage.currentValue}% Pos</span>
            <span className="text-amber-500 font-bold">{data.neutralPercentage.currentValue}% Neu</span>
            <span className="text-rose-500 font-bold">{data.negativePercentage.currentValue}% Neg</span>
          </div>
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden flex">
            <div style={{ width: `${data.positivePercentage.currentValue}%` }} className="bg-emerald-500 h-full" />
            <div style={{ width: `${data.neutralPercentage.currentValue}%` }} className="bg-amber-500 h-full" />
            <div style={{ width: `${data.negativePercentage.currentValue}%` }} className="bg-rose-500 h-full" />
          </div>
        </CardContent>
      </Card>

      {/* 7. Active Themes */}
      <Card className="bg-card/70 backdrop-blur-sm border-border/60 hover:border-border transition duration-150">
        <CardContent className="p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Active Themes</span>
            <Layers className="h-4 w-4 text-teal-500 opacity-80" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-foreground">{data.activeThemesCount}</div>
          <div className="text-[11px] text-muted-foreground">Categorized feedback themes</div>
        </CardContent>
      </Card>

      {/* 8. Workspace Team */}
      <Card className="bg-card/70 backdrop-blur-sm border-border/60 hover:border-border transition duration-150">
        <CardContent className="p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Workspace Team</span>
            <Users className="h-4 w-4 text-indigo-500 opacity-80" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{data.workspaceMembersCount}</span>
            <span className="text-xs text-muted-foreground font-semibold">Members</span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">{data.pendingInvitationsCount}</span> pending invitations
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
