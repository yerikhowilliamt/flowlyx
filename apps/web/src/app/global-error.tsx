'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-dvh bg-zinc-950 flex flex-col items-center justify-center gap-6 text-center px-4">
        <p className="text-6xl font-bold text-orange-500">500</p>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">Critical error</h1>
          <p className="text-zinc-400 text-sm max-w-sm">
            A critical error occurred. Please refresh the page.
          </p>
        </div>
        <Button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
        >
          Refresh
        </Button>
      </body>
    </html>
  );
}
