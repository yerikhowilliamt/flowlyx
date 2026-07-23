'use me';
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Users, Settings, Activity, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminHeader() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Overview',
      href: '/admin',
      icon: LayoutDashboard,
      active: pathname === '/admin',
    },
    {
      label: 'User Management',
      href: '/admin/users',
      icon: Users,
      active: pathname === '/admin/users',
    },
    {
      label: 'System Configuration',
      href: '/admin/configurations',
      icon: Settings,
      active: pathname === '/admin/configurations',
    },
    {
      label: 'Audit Logs',
      href: '/admin/audit-logs',
      icon: Activity,
      active: pathname === '/admin/audit-logs',
    },
  ];

  return (
    <div className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Admin Console</h1>
              <p className="text-xs text-zinc-400">Flowlyx System Administration</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150',
                    item.active
                      ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent',
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
