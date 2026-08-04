import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative grid min-h-dvh place-content-center bg-zinc-950 selection:bg-orange-500 selection:text-white">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      <div className="w-full space-y-6">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center justify-center gap-y-2">
          <Link href="/" className="flex items-center gap-x-2 group">
            <div>
              <Image src={'/Flowlyx.webp'} alt="Flowlyx" width={90} height={26} priority />
            </div>
          </Link>
        </div>

        {/* Content Box */}
        <div className="relative w-full min-w-xs md:border md:p-4 md:min-w-md rounded-2xl">
          {children}
        </div>
      </div>
    </main>
  );
}
