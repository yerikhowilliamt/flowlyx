'use client';

import { useEffect, useState, useCallback } from 'react';
import { getOrganizations } from '@/features/organizations/api/organizations.api';
import { OrganizationSummary } from '@/features/organizations/types/organization.types';
import { OrganizationManagementTable } from '@/features/admin/components/organization-management-table';
import { Building2, Loader2 } from 'lucide-react';

export default function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrgs = useCallback(async () => {
    try {
      const data = await getOrganizations();
      setOrganizations(data);
    } catch {
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await getOrganizations();
        if (active) setOrganizations(data);
      } catch {
        if (active) setOrganizations([]);
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
          <Building2 className="w-5 h-5 text-orange-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Organization Management
          </h1>
        </div>
        <p className="text-sm text-zinc-400 mt-1">
          Manage tenant organizations, create new tenants, or remove existing ones across the platform.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-zinc-400">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500 mr-2" />
          <span>Loading organizations...</span>
        </div>
      ) : (
        <OrganizationManagementTable initialOrganizations={organizations} onRefresh={fetchOrgs} />
      )}
    </div>
  );
}
