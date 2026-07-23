'use me';
'use client';

import { useEffect, useState } from 'react';
import { getUsers, getSystemConfigs, getAuditLogs } from '@/features/admin/api/admin.api';
import { AdminOverviewStats } from '@/features/admin/components/admin-overview-stats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Settings, Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminOverviewPage() {
  const [userCount, setUserCount] = useState(0);
  const [configCount, setConfigCount] = useState(0);
  const [auditCount, setAuditCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function loadStats() {
      try {
        const [users, configs, logs] = await Promise.all([
          getUsers().catch(() => []),
          getSystemConfigs().catch(() => []),
          getAuditLogs().catch(() => []),
        ]);
        if (mounted) {
          setUserCount(users.length);
          setConfigCount(configs.length);
          setAuditCount(logs.length);
        }
      } catch {
        // Fallback
      }
    }
    loadStats();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Overview</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Monitor system metrics, access user administration, environment configurations, and
          security audit logs.
        </p>
      </div>

      <AdminOverviewStats userCount={userCount} configCount={configCount} auditCount={auditCount} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Management Card */}
        <Card className="bg-zinc-900/60 border-zinc-800 hover:border-orange-500/30 transition-all group">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                User Management
              </CardTitle>
            </div>
            <CardDescription className="text-zinc-400 text-xs">
              Manage accounts, assign roles (Admin, User), and update access status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 text-xs font-semibold text-orange-400 group-hover:text-orange-300"
            >
              Go to Users <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardContent>
        </Card>

        {/* System Configuration Card */}
        <Card className="bg-zinc-900/60 border-zinc-800 hover:border-orange-500/30 transition-all group">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                System Configuration
              </CardTitle>
            </div>
            <CardDescription className="text-zinc-400 text-xs">
              Configure environment parameters, global system flags, and limits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/configurations"
              className="inline-flex items-center gap-2 text-xs font-semibold text-orange-400 group-hover:text-orange-300"
            >
              Go to Configurations <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardContent>
        </Card>

        {/* Audit Logs Card */}
        <Card className="bg-zinc-900/60 border-zinc-800 hover:border-orange-500/30 transition-all group">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Audit Logs
              </CardTitle>
            </div>
            <CardDescription className="text-zinc-400 text-xs">
              Track administrative actions, security events, and data changes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/audit-logs"
              className="inline-flex items-center gap-2 text-xs font-semibold text-orange-400 group-hover:text-orange-300"
            >
              Go to Audit Logs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
