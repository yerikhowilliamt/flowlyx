import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-zinc-950 flex flex-col items-center justify-center gap-6 text-center px-4">
      <p className="text-8xl font-bold text-orange-500">404</p>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-white">Page not found</h1>
        <p className="text-zinc-400 text-sm max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
