'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    /* ponytail: no structured logger on client boundary — upgrade to Sentry/Datadog when observability stack is ready */
  }, [error]);

  return (
    <div className="min-h-dvh bg-zinc-950 flex flex-col items-center justify-center gap-6 text-center px-4">
      <p className="text-6xl font-bold text-orange-500">500</p>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-white">Something went wrong</h1>
        <p className="text-zinc-400 text-sm max-w-sm">
          An unexpected error occurred. Our team has been notified.
        </p>
        {error.digest && (
          <p className="text-zinc-600 text-xs font-mono">Error ID: {error.digest}</p>
        )}
      </div>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
