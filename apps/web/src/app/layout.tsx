import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Geist } from 'next/font/google';
import { QueryProvider } from '@/providers/query-provider';
import { Toaster } from 'sonner';
import './globals.css';
import { cn } from '@/lib/utils';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Flowlyx',
  description: 'Enterprise Project Management Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn('dark', plusJakarta.variable, 'font-sans', geist.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <QueryProvider>
          {children}
          <Toaster theme="dark" position="bottom-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
