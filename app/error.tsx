"use client";

import { ErrorState } from "@/components/common/error-state";

export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center p-6">
          <ErrorState
            title="Something went wrong"
            description={error.digest ? `Reference: ${error.digest}` : error.message}
            actionLabel="Try again"
            onAction={reset}
          />
        </main>
      </body>
    </html>
  );
}
