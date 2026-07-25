'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Users, Settings, Activity, LayoutDashboard, Home, User } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useReleaseVersion } from '../hooks/use-release-version';

export function AdminHeader() {
  const pathname = usePathname();
  const { data: rcInfo } = useReleaseVersion();

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
      label: 'Global Settings',
      href: '/admin/settings',
      icon: Settings,
      active: pathname === '/admin/settings',
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
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                Admin Console
                {rcInfo?.version && (
                  <span className="text-4xs font-mono font-medium px-1.5 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-400">
                    {rcInfo.version}
                  </span>
                )}
              </h1>
              <p className="text-xs text-zinc-400">Flowlyx System Administration</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
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

            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-all"
                title="Go to Home"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Home</span>
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-all"
                title="Go to Profile"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
