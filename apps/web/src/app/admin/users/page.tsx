'use me';
'use client';

import { useEffect, useState, useCallback } from 'react';
import { getUsers } from '@/features/admin/api/admin.api';
import { AdminUser } from '@/features/admin/types/admin.types';
import { UsersManagementTable } from '@/features/admin/components/users-management-table';
import { Users, Loader2 } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await getUsers();
        if (active) setUsers(data);
      } catch {
        if (active) setUsers([]);
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
          <Users className="w-5 h-5 text-orange-400" />
          <h1 className="text-2xl font-bold text-white tracking-tight">User Management</h1>
        </div>
        <p className="text-sm text-zinc-400 mt-1">
          View and manage registered accounts, roles, and authorization states.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-zinc-400">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500 mr-2" />
          <span>Loading users...</span>
        </div>
      ) : (
        <UsersManagementTable initialUsers={users} onRefresh={fetchUsers} />
      )}
    </div>
  );
}
