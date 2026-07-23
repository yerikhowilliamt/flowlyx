'use me';
'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSystemConfigs } from '@/features/admin/api/admin.api';
import { SystemConfig } from '@/features/admin/types/admin.types';
import { SystemConfigTable } from '@/features/admin/components/system-config-table';
import { Settings, Loader2 } from 'lucide-react';

export default function AdminConfigurationsPage() {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConfigs = useCallback(async () => {
    try {
      const data = await getSystemConfigs();
      setConfigs(data);
    } catch {
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await getSystemConfigs();
        if (active) setConfigs(data);
      } catch {
        if (active) setConfigs([]);
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
          <Settings className="w-5 h-5 text-orange-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">System Configurations</h1>
        </div>
        <p className="text-sm text-zinc-400 mt-1">
          Manage system-wide environment variables and configuration parameters.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-zinc-400">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500 mr-2" />
          <span>Loading configurations...</span>
        </div>
      ) : (
        <SystemConfigTable initialConfigs={configs} onRefresh={fetchConfigs} />
      )}
    </div>
  );
}
