import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { QueryProvider } from '@/providers/query-provider';
import { Toaster } from 'sonner';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f97316',
};

export const metadata: Metadata = {
  title: {
    default: 'Flowlyx',
    template: '%s | Flowlyx',
  },
  description: 'Enterprise Project Management Platform — collaborate, track, and ship faster.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://flowlyx.com'),
  openGraph: {
    type: 'website',
    siteName: 'Flowlyx',
    title: 'Flowlyx',
    description: 'Enterprise Project Management Platform',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flowlyx',
    description: 'Enterprise Project Management Platform',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${plusJakarta.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <QueryProvider>
          {children}
          <Toaster theme="dark" position="bottom-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
