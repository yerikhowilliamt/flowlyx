'use client';

import { useState } from 'react';
import { Setting } from '../types/settings.types';
import { useCreateSetting, useUpdateSetting, useDeleteSetting } from '../hooks/use-settings';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Search, Trash2, Edit, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsTableProps {
  initialSettings: Setting[];
  onRefresh: () => void;
}

export function SettingsTable({ initialSettings, onRefresh }: SettingsTableProps) {
  const [settings, setSettings] = useState<Setting[]>(initialSettings);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<Setting | null>(null);
  const [deletingSetting, setDeletingSetting] = useState<Setting | null>(null);

  // Form states
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newType, setNewType] = useState<'STRING' | 'BOOLEAN' | 'JSON' | 'NUMBER'>('STRING');
  const [newGroup, setNewGroup] = useState<'GENERAL' | 'SYSTEM' | 'SECURITY'>('GENERAL');
  const [newDescription, setNewDescription] = useState('');
  const [newIsPublic, setNewIsPublic] = useState(false);

  const createSettingMutation = useCreateSetting();
  const updateSettingMutation = useUpdateSetting();
  const deleteSettingMutation = useDeleteSetting();

  const filteredSettings = settings.filter(
    (s) =>
      !search ||
      s.key.toLowerCase().includes(search.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(search.toLowerCase())) ||
      s.group.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreate = async () => {
    if (!newKey || !newValue) {
      toast.error('Key and Value are required');
      return;
    }
    try {
      const created = await createSettingMutation.mutateAsync({
        key: newKey.toUpperCase().trim(),
        value: newValue,
        type: newType,
        group: newGroup,
        description: newDescription || undefined,
        isPublic: newIsPublic,
      });
      setSettings((prev) => [...prev, created]);
      toast.success(`Setting ${newKey} created.`);
      setIsCreateOpen(false);
      resetForm();
      onRefresh();
    } catch {
      toast.error('Failed to create setting.');
    }
  };

  const handleUpdate = async () => {
    if (!editingSetting) return;
    try {
      const updated = await updateSettingMutation.mutateAsync({
        id: editingSetting.id,
        payload: {
          key: newKey.toUpperCase().trim(),
          value: newValue,
          type: newType,
          group: newGroup,
          description: newDescription || undefined,
          isPublic: newIsPublic,
        },
      });
      setSettings((prev) =>
        prev.map((s) => (s.id === editingSetting.id ? { ...s, ...updated } : s)),
      );
      toast.success(`Setting ${editingSetting.key} updated.`);
      setEditingSetting(null);
      resetForm();
      onRefresh();
    } catch {
      toast.error('Failed to update setting.');
    }
  };

  const handleDelete = async () => {
    if (!deletingSetting) return;
    try {
      await deleteSettingMutation.mutateAsync(deletingSetting.id);
      setSettings((prev) => prev.filter((s) => s.id !== deletingSetting.id));
      toast.success(`Setting ${deletingSetting.key} deleted.`);
      setDeletingSetting(null);
      onRefresh();
    } catch {
      toast.error('Failed to delete setting.');
    }
  };

  const resetForm = () => {
    setNewKey('');
    setNewValue('');
    setNewType('STRING');
    setNewGroup('GENERAL');
    setNewDescription('');
    setNewIsPublic(false);
  };

  const openEdit = (setting: Setting) => {
    setEditingSetting(setting);
    setNewKey(setting.key);
    setNewValue(setting.value);
    setNewType(setting.type);
    setNewGroup(setting.group);
    setNewDescription(setting.description || '');
    setNewIsPublic(setting.isPublic);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Search setting keys or descriptions..."
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
            Add Setting
          </Button>
        </div>
      </div>

      {/* Settings Table */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-x-auto">
        <Table>
          <TableHeader className="bg-zinc-950/60">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400 font-semibold">Key</TableHead>
              <TableHead className="text-zinc-400 font-semibold">Value</TableHead>
              <TableHead className="text-zinc-400 font-semibold">Type</TableHead>
              <TableHead className="text-zinc-400 font-semibold">Group</TableHead>
              <TableHead className="text-zinc-400 font-semibold">Visibility</TableHead>
              <TableHead className="text-zinc-400 font-semibold">Description</TableHead>
              <TableHead className="text-right text-zinc-400 font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSettings.length === 0 ? (
              <TableRow className="border-zinc-800">
                <TableCell colSpan={7} className="text-center py-8 text-zinc-500">
                  No settings found.
                </TableCell>
              </TableRow>
            ) : (
              filteredSettings.map((setting) => (
                <TableRow
                  key={setting.id}
                  className="border-zinc-800/60 hover:bg-zinc-900/40"
                >
                  <TableCell className="font-mono text-xs font-semibold text-orange-400">
                    {setting.key}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-zinc-200 max-w-xs truncate">
                    {setting.value}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-xs border-zinc-700 bg-zinc-800 text-zinc-300"
                    >
                      {setting.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-xs border-zinc-700 bg-zinc-900 text-zinc-400 font-mono"
                    >
                      {setting.group}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        setting.isPublic
                          ? 'text-xs border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                          : 'text-xs border-zinc-700 bg-zinc-800 text-zinc-400'
                      }
                    >
                      {setting.isPublic ? 'Public' : 'Private'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-400 max-w-sm truncate">
                    {setting.description || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEdit(setting)}
                        className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-[0.97] transition-all duration-150 cursor-pointer"
                        aria-label={`Edit setting ${setting.key}`}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeletingSetting(setting)}
                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 active:scale-[0.97] transition-all duration-150 cursor-pointer"
                        aria-label={`Delete setting ${setting.key}`}
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
            <DialogTitle>New Global Setting</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Add a global system setting entry.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Key Name</label>
              <Input
                placeholder="e.g. ALLOW_REGISTRATION"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                className="bg-zinc-950 border-zinc-800 text-zinc-200 font-mono text-sm uppercase"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Type</label>
                <Select
                  value={newType}
                  onValueChange={(val) => {
                    if (val) setNewType(val as 'STRING' | 'BOOLEAN' | 'JSON' | 'NUMBER');
                  }}
                >
                  <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-200">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                    <SelectItem value="STRING">STRING</SelectItem>
                    <SelectItem value="BOOLEAN">BOOLEAN</SelectItem>
                    <SelectItem value="NUMBER">NUMBER</SelectItem>
                    <SelectItem value="JSON">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Group</label>
                <Select
                  value={newGroup}
                  onValueChange={(val) => {
                    if (val) setNewGroup(val as 'GENERAL' | 'SYSTEM' | 'SECURITY');
                  }}
                >
                  <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-200">
                    <SelectValue placeholder="Group" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                    <SelectItem value="GENERAL">GENERAL</SelectItem>
                    <SelectItem value="SYSTEM">SYSTEM</SelectItem>
                    <SelectItem value="SECURITY">SECURITY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Value</label>
              <Textarea
                placeholder="Setting value"
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
            <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg border border-zinc-800">
              <div className="space-y-0.5">
                <span className="text-sm font-medium text-zinc-200">Public Access</span>
                <p className="text-xs text-zinc-400">Expose setting to unauthenticated clients.</p>
              </div>
              <Switch checked={newIsPublic} onCheckedChange={setNewIsPublic} />
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
              disabled={createSettingMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {createSettingMutation.isPending ? 'Creating...' : 'Create Setting'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingSetting} onOpenChange={() => setEditingSetting(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Global Setting</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Key:{' '}
              <span className="text-orange-400 font-mono font-semibold">{editingSetting?.key}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Key Name</label>
              <Input
                value={newKey}
                onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                className="bg-zinc-950 border-zinc-800 text-zinc-200 font-mono text-sm uppercase"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Type</label>
                <Select
                  value={newType}
                  onValueChange={(val) => {
                    if (val) setNewType(val as 'STRING' | 'BOOLEAN' | 'JSON' | 'NUMBER');
                  }}
                >
                  <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-200">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                    <SelectItem value="STRING">STRING</SelectItem>
                    <SelectItem value="BOOLEAN">BOOLEAN</SelectItem>
                    <SelectItem value="NUMBER">NUMBER</SelectItem>
                    <SelectItem value="JSON">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Group</label>
                <Select
                  value={newGroup}
                  onValueChange={(val) => {
                    if (val) setNewGroup(val as 'GENERAL' | 'SYSTEM' | 'SECURITY');
                  }}
                >
                  <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-200">
                    <SelectValue placeholder="Group" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                    <SelectItem value="GENERAL">GENERAL</SelectItem>
                    <SelectItem value="SYSTEM">SYSTEM</SelectItem>
                    <SelectItem value="SECURITY">SECURITY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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
            <div className="flex items-center justify-between p-3 bg-zinc-950 rounded-lg border border-zinc-800">
              <div className="space-y-0.5">
                <span className="text-sm font-medium text-zinc-200">Public Access</span>
                <p className="text-xs text-zinc-400">Expose setting to unauthenticated clients.</p>
              </div>
              <Switch checked={newIsPublic} onCheckedChange={setNewIsPublic} />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingSetting(null)}
              className="border-zinc-800 text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateSettingMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {updateSettingMutation.isPending ? 'Updating...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={!!deletingSetting} onOpenChange={() => setDeletingSetting(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-400">Delete Setting Key</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to delete global setting{' '}
              <span className="text-white font-mono font-semibold">{deletingSetting?.key}</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingSetting(null)}
              className="border-zinc-800 text-zinc-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteSettingMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteSettingMutation.isPending ? 'Deleting...' : 'Delete Key'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
