import { ReactNode } from 'react';
import { AdminHeader } from '@/features/admin/components/admin-header';

export const metadata = {
  title: 'Admin Console | Flowlyx',
  description: 'System Administration for Flowlyx Platform',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <AdminHeader />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
