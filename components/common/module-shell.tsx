import { CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AppModule } from "@/types/navigation";

type ModuleShellProps = {
  module: AppModule;
};

export function ModuleShell({ module }: ModuleShellProps) {
  const Icon = module.icon;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6 shadow-panel">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-muted text-primary">
              <Icon className="size-5" />
            </div>
            <div>
              <Badge variant="muted">{module.status}</Badge>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
                {module.title}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {module.description}
              </p>
            </div>
          </div>
        </div>
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Readiness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {module.readiness.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-md border bg-background/60 p-4 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="size-4 shrink-0 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
