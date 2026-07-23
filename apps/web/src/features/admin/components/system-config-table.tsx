'use client';

import { useState } from 'react';
import { SystemConfig } from '../types/admin.types';
import { createSystemConfig, updateSystemConfig, deleteSystemConfig } from '../api/admin.api';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Search, Trash2, Edit, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface SystemConfigTableProps {
  initialConfigs: SystemConfig[];
  onRefresh: () => void;
}

export function SystemConfigTable({ initialConfigs, onRefresh }: SystemConfigTableProps) {
  const [configs, setConfigs] = useState<SystemConfig[]>(initialConfigs);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SystemConfig | null>(null);
  const [deletingConfig, setDeletingConfig] = useState<SystemConfig | null>(null);

  // Form states
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState('STRING');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredConfigs = configs.filter(
    (c) =>
      !search ||
      c.key.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase())),
  );

  const handleCreate = async () => {
    if (!newKey || !newValue) {
      toast.error('Key and Value are required');
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await createSystemConfig({
        key: newKey.toUpperCase().trim(),
        value: newValue,
        description: newDescription || undefined,
        type: newType,
      });
      setConfigs((prev) => [...prev, created]);
      toast.success(`System configuration ${newKey} created.`);
      setIsCreateOpen(false);
      resetForm();
      onRefresh();
    } catch {
      toast.error('Failed to create system configuration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingConfig) return;
    setIsSubmitting(true);
    try {
      const updated = await updateSystemConfig(editingConfig.key, {
        value: newValue,
        description: newDescription || undefined,
        type: newType,
      });
      setConfigs((prev) =>
        prev.map((c) =>
          c.key === editingConfig.key
            ? { ...c, ...updated, value: newValue, description: newDescription, type: newType }
            : c,
        ),
      );
      toast.success(`Configuration ${editingConfig.key} updated.`);
      setEditingConfig(null);
      resetForm();
      onRefresh();
    } catch {
      toast.error('Failed to update system configuration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingConfig) return;
    setIsSubmitting(true);
    try {
      await deleteSystemConfig(deletingConfig.key);
      setConfigs((prev) => prev.filter((c) => c.key !== deletingConfig.key));
      toast.success(`Configuration ${deletingConfig.key} deleted.`);
      setDeletingConfig(null);
      onRefresh();
    } catch {
      toast.error('Failed to delete system configuration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewKey('');
    setNewValue('');
    setNewDescription('');
    setNewType('STRING');
  };

  const openEdit = (config: SystemConfig) => {
    setEditingConfig(config);
    setNewValue(config.value);
    setNewDescription(config.description || '');
    setNewType(config.type || 'STRING');
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Search config keys or descriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-zinc-950/80 border-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            className="border-zinc-800 bg-zinc-950/80 hover:bg-zinc-900 text-zinc-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setIsCreateOpen(true);
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Configuration
          </Button>
        </div>
      </div>

      {/* Configs Table */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-950/60">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400 font-semibold">Key</TableHead>
              <TableHead className="text-zinc-400 font-semibold">Value</TableHead>
              <TableHead className="text-zinc-400 font-semibold">Type</TableHead>
              <TableHead className="text-zinc-400 font-semibold">Description</TableHead>
              <TableHead className="text-right text-zinc-400 font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredConfigs.length === 0 ? (
              <TableRow className="border-zinc-800">
                <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                  No system configurations found.
                </TableCell>
              </TableRow>
            ) : (
              filteredConfigs.map((config) => (
                <TableRow
                  key={config.id || config.key}
                  className="border-zinc-800/60 hover:bg-zinc-900/40"
                >
                  <TableCell className="font-mono text-xs font-semibold text-orange-400">
                    {config.key}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-zinc-200 max-w-xs truncate">
                    {config.value}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-xs border-zinc-700 bg-zinc-800 text-zinc-300"
                    >
                      {config.type || 'STRING'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-400 max-w-sm truncate">
                    {config.description || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEdit(config)}
                        className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeletingConfig(config)}
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New System Configuration</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Add a global key-value configuration entry.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Key Name</label>
              <Input
                placeholder="e.g. MAX_LOGIN_ATTEMPTS"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                className="bg-zinc-950 border-zinc-800 text-zinc-200 font-mono text-sm uppercase"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Value</label>
              <Textarea
                placeholder="Configuration value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-zinc-200 font-mono text-sm h-20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Description</label>
              <Input
                placeholder="Optional description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-zinc-200 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              className="border-zinc-800 text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isSubmitting}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isSubmitting ? 'Creating...' : 'Create Configuration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingConfig} onOpenChange={() => setEditingConfig(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Configuration</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Key:{' '}
              <span className="text-orange-400 font-mono font-semibold">{editingConfig?.key}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Value</label>
              <Textarea
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-zinc-200 font-mono text-sm h-24"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Description</label>
              <Input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-zinc-200 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingConfig(null)}
              className="border-zinc-800 text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isSubmitting}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isSubmitting ? 'Updating...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={!!deletingConfig} onOpenChange={() => setDeletingConfig(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-400">Delete Configuration Key</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to delete configuration{' '}
              <span className="text-white font-mono font-semibold">{deletingConfig?.key}</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingConfig(null)}
              className="border-zinc-800 text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Key'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
