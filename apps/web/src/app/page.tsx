export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 p-8">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="text-primary">Flow</span>lyx
        </h1>
        <p className="text-muted-foreground">Enterprise Project Management Platform</p>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-secondary p-6">
        <div className="flex items-center gap-2">
          <span className="inline-block size-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium">Frontend Foundation Ready</span>
        </div>
        <p className="text-xs text-muted-foreground">Next.js • Tailwind CSS • TanStack Query</p>
      </div>
    </main>
  );
}
