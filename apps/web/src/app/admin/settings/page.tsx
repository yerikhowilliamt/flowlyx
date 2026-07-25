'use me';
'use client';

import { useSettings } from '@/features/settings/hooks/use-settings';
import { SettingsTable } from '@/features/settings/components/settings-table';
import { Settings, Loader2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const { data: settings = [], isLoading, refetch } = useSettings();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-orange-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Global Settings</h1>
        </div>
        <p className="text-sm text-zinc-400 mt-1">
          Manage general, system, and security settings for the Flowlyx platform.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-zinc-400">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500 mr-2" />
          <span>Loading settings...</span>
        </div>
      ) : (
        <SettingsTable initialSettings={settings} onRefresh={refetch} />
      )}
    </div>
  );
}
