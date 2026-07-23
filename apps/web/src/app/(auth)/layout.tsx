import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative grid min-h-dvh place-content-center bg-zinc-950 px-4 selection:bg-orange-500 selection:text-white">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center justify-center gap-y-2">
          <Link href="/" className="flex items-center gap-x-2 group">
            <div>
              <Image src={'/Flowlyx.webp'} alt="Flowlyx" width={90} height={26} priority />
            </div>
          </Link>
        </div>

        {/* Content Box */}
        <div className="relative rounded-2xl border border-zinc-900 bg-zinc-900/40 p-1 backdrop-blur-md shadow-2xl">
          <div className="rounded-xl bg-zinc-950 p-6 sm:p-8">{children}</div>
        </div>
      </div>
    </main>
  );
}
