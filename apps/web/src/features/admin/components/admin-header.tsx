'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  Users,
  Settings,
  Activity,
  LayoutDashboard,
  Home,
  User,
  Building2,
  Menu,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useMe } from '@/features/profile/hooks/use-profile';
import { useLogout } from '@/features/auth/hooks/use-logout';
import { useReleaseVersion } from '../hooks/use-release-version';

export function AdminHeader() {
  const pathname = usePathname();
  const { data: rcInfo } = useReleaseVersion();
  const { data: user } = useMe();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const logoutMutation = useLogout();

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
      label: 'Organization Management',
      href: '/admin/organizations',
      icon: Building2,
      active: pathname === '/admin/organizations',
    },
    {
      label: 'System Configuration',
      href: '/admin/configurations',
      icon: Settings,
      active: pathname === '/admin/configurations',
    },
    ...(isSuperAdmin
      ? [
          {
            label: 'Global Settings',
            href: '/admin/settings',
            icon: Settings,
            active: pathname === '/admin/settings',
          },
        ]
      : []),
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

          <div className="flex items-center gap-2">
            {/* Nav Trigger Sheet (replaces dropdown for all screen sizes) */}
            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    className="rounded-xl border-zinc-800 bg-zinc-900/60 text-zinc-200 hover:bg-zinc-800 hover:text-white h-9 px-3 text-sm font-semibold cursor-pointer flex items-center gap-2"
                  >
                    <Menu className="h-4 w-4 text-orange-500" />
                    <span>{navItems.find((i) => i.active)?.label || 'Navigation'}</span>
                  </Button>
                }
              />
              <SheetContent side="left" className="bg-zinc-950 border-zinc-800 text-zinc-100 w-72 p-6">
                <SheetHeader className="pb-6 border-b border-zinc-800 text-left">
                  <SheetTitle className="flex items-center gap-2 text-white font-bold text-lg">
                    <Shield className="w-5 h-5 text-orange-500" />
                    Admin Navigation
                  </SheetTitle>
                </SheetHeader>
                <div className="py-4 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                          item.active
                            ? 'font-semibold bg-orange-500/10 border border-orange-500/20 text-orange-400'
                            : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200',
                        )}
                      >
                        <Icon className={cn('h-4 w-4', item.active ? 'text-orange-500' : 'text-zinc-500')} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>

                <SheetFooter className="space-y-1">
                  <Link
                    href="/"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-all"
                  >
                    <Home className="h-4 w-4 text-zinc-500" />
                    Back to Home
                  </Link>

                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:bg-zinc-900 hover:text-zinc-200 transition-all"
                  >
                    <User className="h-4 w-4 text-zinc-500" />
                    Profile
                  </Link>

                  <Button
                    variant="ghost"
                    onClick={() => logoutMutation.mutate()}
                    className="w-full justify-start items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500/80 hover:bg-red-500/10 hover:text-red-400 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
}
