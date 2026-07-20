import { CheckCircle2, Database, KeyRound, Layers3, Server, Sparkles } from "lucide-react";

import { SectionHeader } from "@/components/common/section-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const foundationCards = [
  {
    title: "Application Shell",
    description:
      "Responsive dashboard layout, route groups, global boundaries, metadata, and dark mode.",
    icon: Layers3,
  },
  {
    title: "Auth Boundary",
    description:
      "Auth.js route handlers, middleware structure, public routes, protected route prefixes, and RBAC types.",
    icon: KeyRound,
  },
  {
    title: "Data Boundary",
    description:
      "Prisma client lifecycle, PostgreSQL datasource, migration directory, and seed entry point.",
    icon: Database,
  },
  {
    title: "API Boundary",
    description:
      "Module route handlers return explicit 501 responses until product workflows are implemented.",
    icon: Server,
  },
  {
    title: "AI Boundary",
    description:
      "Provider contracts define classification, embedding, theme clustering, RAG chat, and summarization.",
    icon: Sparkles,
  },
  {
    title: "Design System",
    description:
      "shadcn-compatible primitives, design tokens, loading states, error states, and toast provider.",
    icon: CheckCircle2,
  },
];

export function FoundationOverview() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6 shadow-panel">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="Project LOOP"
            title="Production foundation"
            description="The Phase 1 platform surface is ready for authentication, workspaces, RBAC, feedback ingestion, AI intelligence, analytics, reporting, notifications, and team management modules."
          />
          <Badge variant="secondary">Phase 1</Badge>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {foundationCards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <div className="mb-3 flex size-10 items-center justify-center rounded-md border bg-muted text-primary">
                <card.icon className="size-4" />
              </div>
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Clean Architecture Contract</CardTitle>
          <CardDescription>
            Future modules should enter through route handlers or server actions, validate with Zod,
            delegate business workflows to services, and isolate database reads and writes in
            repositories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-5">
            {["Routes", "Validators", "Services", "Repositories", "Prisma"].map((layer) => (
              <div
                key={layer}
                className="rounded-md border bg-background/60 p-4 text-center font-medium"
              >
                {layer}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
