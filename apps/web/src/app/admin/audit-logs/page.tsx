'use me';
'use client';

import { useEffect, useState, useCallback } from 'react';
import { getAuditLogs } from '@/features/admin/api/admin.api';
import { AuditLog } from '@/features/admin/types/admin.types';
import { AuditLogsTable } from '@/features/admin/components/audit-logs-table';
import { Activity, Loader2 } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      const data = await getAuditLogs();
      setLogs(data);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await getAuditLogs();
        if (active) setLogs(data);
      } catch {
        if (active) setLogs([]);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-orange-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Audit Logs</h1>
        </div>
        <p className="text-sm text-zinc-400 mt-1">
          Review security and administrative action trails across the platform.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-zinc-400">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500 mr-2" />
          <span>Loading audit logs...</span>
        </div>
      ) : (
        <AuditLogsTable initialLogs={logs} onRefresh={fetchLogs} />
      )}
    </div>
  );
}
