"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function ErrorState({ title, description, actionLabel, onAction }: ErrorStateProps) {
  return (
    <section className="w-full max-w-md rounded-lg border bg-card p-6 text-center shadow-panel">
      <div className="mx-auto flex size-11 items-center justify-center rounded-full border bg-muted text-muted-foreground">
        <AlertTriangle className="size-5" />
      </div>
      <h1 className="mt-5 text-xl font-semibold tracking-tight">{title}</h1>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </section>
  );
}
