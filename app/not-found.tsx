import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="surface-grid flex min-h-screen items-center justify-center p-6">
      <section className="w-full max-w-lg rounded-lg border bg-card p-8 text-center shadow-panel">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">404</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The route exists outside the current Project LOOP foundation.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Return to dashboard</Link>
        </Button>
      </section>
    </main>
  );
}
