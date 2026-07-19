export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-dvh place-content-center">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
