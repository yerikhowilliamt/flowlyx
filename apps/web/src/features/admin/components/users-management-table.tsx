'use client';

import { useState } from 'react';
import { AdminUser, UserRole, UserStatus } from '../types/admin.types';
import { updateUser, deleteUser } from '../api/admin.api';
import { getAccessToken } from '@/lib/api-client';
import { AssignmentDialog } from './assignment-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Trash2, Edit, RefreshCw, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface UsersManagementTableProps {
  initialUsers: AdminUser[];
  onRefresh: () => void;
}

export function UsersManagementTable({ initialUsers, onRefresh }: UsersManagementTableProps) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [assigningUser, setAssigningUser] = useState<AdminUser | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('USER');
  const [newStatus, setNewStatus] = useState<UserStatus>('ACTIVE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const getErrorMessage = (err: unknown, defaultMsg: string): string => {
    if (err && typeof err === 'object' && 'data' in err) {
      const data = (err as { data?: { message?: string | string[] } }).data;
      if (data?.message) {
        return Array.isArray(data.message) ? data.message.join(', ') : data.message;
      }
    }
    if (err instanceof Error && err.message) {
      return err.message;
    }
    return defaultMsg;
  };

  const handleEditClick = (user: AdminUser) => {
    setEditingUser(user);
    setNewRole(user.role);
    setNewStatus(user.status);
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      const updated = await updateUser(editingUser.id, {
        role: newRole,
        status: newStatus,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id ? { ...u, ...updated, role: newRole, status: newStatus } : u,
        ),
      );
      toast.success(`User ${editingUser.email} updated successfully.`);
      setEditingUser(null);
      onRefresh();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update user. Insufficient permissions.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    setIsSubmitting(true);
    try {
      await deleteUser(deletingUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      toast.success(`User ${deletingUser.email} deleted successfully.`);
      setDeletingUser(null);
      onRefresh();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete user. Insufficient permissions.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
            SUPER ADMIN
          </Badge>
        );
      case 'ADMIN':
        return (
          <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">ADMIN</Badge>
        );
      default:
        return <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700">USER</Badge>;
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">ACTIVE</Badge>
        );
      case 'INACTIVE':
        return <Badge className="bg-zinc-700 text-zinc-400 border-zinc-600">INACTIVE</Badge>;
      case 'SUSPENDED':
        return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">SUSPENDED</Badge>;
      default:
        return <Badge className="bg-zinc-800 text-zinc-400">UNKNOWN</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-zinc-950/80 border-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <NativeSelect
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-zinc-950/80 border-zinc-800 text-sm text-zinc-200"
          >
            <option value="ALL">All Roles</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </NativeSelect>

          <NativeSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-950/80 border-zinc-800 text-sm text-zinc-200"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </NativeSelect>

          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            className="border-zinc-800 bg-zinc-950/80 hover:bg-zinc-900 text-zinc-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-950/60">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400 font-semibold">User</TableHead>
              <TableHead className="text-zinc-400 font-semibold">Role</TableHead>
              <TableHead className="text-zinc-400 font-semibold">Status</TableHead>
              <TableHead className="text-zinc-400 font-semibold">Joined</TableHead>
              <TableHead className="text-right text-zinc-400 font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow className="border-zinc-800">
                <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-zinc-800/60 hover:bg-zinc-900/40">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-xs">
                        {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-zinc-200 text-sm">
                          {user.name || 'Unnamed User'}
                        </div>
                        <div className="text-xs text-zinc-400">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="text-xs text-zinc-400">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    {(() => {
                      const token = typeof window !== 'undefined' ? getAccessToken() : null;
                      let currentUserRole = 'USER';
                      if (token) {
                        try {
                          const payload = JSON.parse(atob(token.split('.')[1]));
                          currentUserRole = payload.role || 'USER';
                        } catch {
                          // Ignored
                        }
                      }
                      const isTargetSuperAdmin = user.role === 'SUPER_ADMIN';
                      const isDisabled = currentUserRole !== 'SUPER_ADMIN' && isTargetSuperAdmin;
                      const isSuperAdminActor = currentUserRole === 'SUPER_ADMIN';

                      return (
                        <div className="flex items-center justify-end gap-1">
                          {isSuperAdminActor && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setAssigningUser(user)}
                              className="h-8 w-8 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                              title="Assign to organization / workspace / project"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEditClick(user)}
                            disabled={isDisabled}
                            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeletingUser(user)}
                            disabled={isDisabled}
                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      );
                    })()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Permissions</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Update role and status for{' '}
              <span className="text-orange-400 font-semibold">{editingUser?.email}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">System Role</label>
              {(() => {
                const token = typeof window !== 'undefined' ? getAccessToken() : null;
                let currentUserRole = 'USER';
                if (token) {
                  try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    currentUserRole = payload.role || 'USER';
                  } catch {
                    // Ignored
                  }
                }
                const isRoleSelectDisabled = currentUserRole !== 'SUPER_ADMIN';

                return (
                  <NativeSelect
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    disabled={isRoleSelectDisabled}
                    className="w-full bg-zinc-950 border-zinc-800 text-zinc-200 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </NativeSelect>
                );
              })()}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">Account Status</label>
              <NativeSelect
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as UserStatus)}
                className="w-full bg-zinc-950 border-zinc-800 text-zinc-200"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </NativeSelect>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingUser(null)}
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isSubmitting}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-400">Delete User Account</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to delete{' '}
              <span className="text-white font-semibold">{deletingUser?.email}</span>? This action
              is permanent.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingUser(null)}
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assignment Dialog */}
      <AssignmentDialog
        user={assigningUser}
        onClose={() => {
          setAssigningUser(null);
          onRefresh();
        }}
      />
    </div>
  );
}
