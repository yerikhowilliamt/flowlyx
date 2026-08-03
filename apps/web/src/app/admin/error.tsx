'use client';

import { Button } from '@/components/ui/button';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <p className="text-5xl font-bold text-orange-500">Error</p>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-white">Failed to load admin panel</h2>
        <p className="text-zinc-400 text-sm">{error.message ?? 'An unexpected error occurred.'}</p>
        {error.digest && (
          <p className="text-zinc-600 text-xs font-mono">Error ID: {error.digest}</p>
        )}
      </div>
      <Button
        onClick={reset}
        className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
      >
        Try again
      </Button>
    </div>
  );
}
