"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, AlertCircle, RefreshCw } from "lucide-react";

interface ChartCardProps {
  title: string;
  subtitle?: string | undefined;
  filterBadge?: string | undefined;
  isLoading?: boolean | undefined;
  error?: string | undefined;
  onRetry?: (() => void) | undefined;
  onDrillDown?: (() => void) | undefined;
  children: ReactNode;
  legend?: ReactNode | undefined;
  heightClassName?: string | undefined;
}

export function ChartCard({
  title,
  subtitle,
  filterBadge,
  isLoading,
  error,
  onRetry,
  onDrillDown,
  children,
  legend,
  heightClassName = "h-72",
}: ChartCardProps) {
  return (
    <Card className="bg-card/70 backdrop-blur-sm border-border/60 hover:border-border transition duration-150 flex flex-col justify-between">
      <CardHeader className="p-4 pb-2 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-bold text-foreground">{title}</CardTitle>
              {filterBadge && (
                <Badge variant="outline" className="text-[10px] border-primary/20 text-primary bg-primary/5 px-1.5 py-0 font-medium">
                  {filterBadge}
                </Badge>
              )}
            </div>
            {subtitle && <CardDescription className="text-xs text-muted-foreground">{subtitle}</CardDescription>}
          </div>

          {onDrillDown && !error && !isLoading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDrillDown}
              className="h-7 text-[11px] font-semibold text-muted-foreground hover:text-primary gap-1 px-2 shrink-0"
            >
              Inbox <ArrowUpRight className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-1 flex-1 flex flex-col justify-between space-y-3">
        {error ? (
          <div className={`${heightClassName} flex flex-col items-center justify-center p-4 text-center border border-dashed border-destructive/30 rounded-lg bg-destructive/5 space-y-2`}>
            <AlertCircle className="h-6 w-6 text-destructive shrink-0" />
            <div className="text-xs text-destructive font-semibold">Failed to load chart metrics</div>
            <p className="text-[11px] text-muted-foreground max-w-xs">{error}</p>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry} className="h-7 text-xs gap-1 mt-1 font-semibold">
                <RefreshCw className="h-3 w-3" /> Retry
              </Button>
            )}
          </div>
        ) : isLoading ? (
          <div className={`${heightClassName} flex items-center justify-center`}>
            <Skeleton className="w-full h-full rounded-lg" />
          </div>
        ) : (
          <div className={`${heightClassName} w-full text-xs`}>{children}</div>
        )}

        {legend && <div className="border-t border-border/40 pt-2 text-xs">{legend}</div>}
      </CardContent>
    </Card>
  );
}
