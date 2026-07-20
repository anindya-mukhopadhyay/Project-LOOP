import { ProjectMark } from "@/components/layout/project-mark";

export function AuthShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <section className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <ProjectMark />
          <div className="mt-10">{children}</div>
        </div>
      </section>
      <section className="relative hidden overflow-hidden border-l bg-card lg:block">
        <div className="surface-grid absolute inset-0 opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-br from-background/0 via-background/40 to-background" />
        <div className="relative flex h-full flex-col justify-end p-12">
          <div className="bg-background/82 max-w-xl rounded-lg border p-8 shadow-glow backdrop-blur">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Enterprise foundation
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">
              Built for multi-tenant feedback intelligence.
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Auth, workspace, RBAC, AI, analytics, and reporting boundaries are separated so
              product modules can scale without cross-layer coupling.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
