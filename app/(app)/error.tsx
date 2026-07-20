"use client";

import { ErrorState } from "@/components/common/error-state";

export default function AppRouteError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <ErrorState
        title="This workspace view failed to load"
        description={error.digest ? `Reference: ${error.digest}` : error.message}
        actionLabel="Reload view"
        onAction={reset}
      />
    </div>
  );
}
