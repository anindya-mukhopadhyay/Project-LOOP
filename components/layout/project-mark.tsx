import { CircuitBoard } from "lucide-react";

import { cn } from "@/lib/utils";

type ProjectMarkProps = {
  compact?: boolean;
  className?: string;
};

export function ProjectMark({ compact = false, className }: ProjectMarkProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex size-9 items-center justify-center rounded-lg border bg-primary text-primary-foreground shadow-sm">
        <CircuitBoard className="size-4" />
      </div>
      {!compact ? (
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">Project LOOP</p>
          <p className="text-xs text-muted-foreground">Feedback intelligence</p>
        </div>
      ) : null}
    </div>
  );
}
