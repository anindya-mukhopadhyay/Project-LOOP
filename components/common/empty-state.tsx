import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, className }: EmptyStateProps) {
  return (
    <section className={cn("rounded-lg border bg-card p-8 text-center shadow-panel", className)}>
      <div className="mx-auto flex size-12 items-center justify-center rounded-md border bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <h2 className="mt-5 text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
    </section>
  );
}
