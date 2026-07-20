import { Skeleton } from "@/components/ui/skeleton";

export function AppLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
        <Skeleton className="h-80" />
      </div>
    </main>
  );
}
