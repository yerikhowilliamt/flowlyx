'use client';

import { Users, Settings, Activity, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OverviewStatsProps {
  userCount: number;
  configCount: number;
  auditCount: number;
}

export function AdminOverviewStats({ userCount, configCount, auditCount }: OverviewStatsProps) {
  const stats = [
    {
      title: 'Total System Users',
      value: userCount,
      description: 'Registered users in system',
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      title: 'System Configurations',
      value: configCount,
      description: 'Active environment keys',
      icon: Settings,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      title: 'Audit Logs Logged',
      value: auditCount,
      description: 'System actions recorded',
      icon: Activity,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      title: 'System Operational Status',
      value: 'Healthy',
      description: 'All services active & normal',
      icon: CheckCircle2,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card
            key={i}
            className="bg-zinc-900/60 border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg} border ${stat.border} ${stat.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white tracking-tight">{stat.value}</div>
              <p className="text-xs text-zinc-400 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
