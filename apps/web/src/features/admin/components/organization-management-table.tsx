'use client';

import { useState } from 'react';
import { OrganizationSummary } from '@/features/organizations/types/organization.types';
import {
  createOrganization,
  updateOrganization,
  deleteOrganization,
} from '@/features/organizations/api/organizations.api';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Plus, Edit2, Trash2, Building2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface OrganizationManagementTableProps {
  initialOrganizations: OrganizationSummary[];
  onRefresh: () => void;
}

export function OrganizationManagementTable({
  initialOrganizations,
  onRefresh,
}: OrganizationManagementTableProps) {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<OrganizationSummary | null>(null);
  const [deletingOrg, setDeletingOrg] = useState<OrganizationSummary | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredOrgs = initialOrganizations.filter(
    (org) =>
      !search ||
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.slug.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditingOrg(null);
    setName('');
    setSlug('');
    setDescription('');
    setModalOpen(true);
  };

  const openEdit = (org: OrganizationSummary) => {
    setEditingOrg(org);
    setName(org.name);
    setSlug(org.slug);
    setDescription('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      toast.error('Name and slug are required');
      return;
    }
    setSubmitting(true);
    try {
      if (editingOrg) {
        await updateOrganization(editingOrg.id, { name, slug, description });
        toast.success('Organization updated successfully');
      } else {
        await createOrganization({ name, slug, description });
        toast.success('Organization created successfully');
      }
      setModalOpen(false);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save organization';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingOrg) return;
    setSubmitting(true);
    try {
      await deleteOrganization(deletingOrg.id);
      toast.success('Organization deleted successfully');
      setDeletingOrg(null);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete organization';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Search organizations by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-zinc-950/80 border-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={openCreate}
            className="bg-orange-500 hover:bg-orange-600 text-white gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Organization
          </Button>

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

      {/* Organizations Table */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-950/60">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400 font-semibold">Name</TableHead>
              <TableHead className="text-zinc-400 font-semibold">Slug</TableHead>
              <TableHead className="text-zinc-400 font-semibold">Status</TableHead>
              <TableHead className="text-right text-zinc-400 font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrgs.length === 0 ? (
              <TableRow className="border-zinc-800">
                <TableCell colSpan={4} className="text-center py-8 text-zinc-500">
                  No organizations found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrgs.map((org) => (
                <TableRow key={org.id} className="border-zinc-800/60 hover:bg-zinc-900/40">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-xs">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-zinc-100 text-sm">{org.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-400 font-mono">{org.slug}</TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                      {org.status || 'ACTIVE'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEdit(org)}
                        className="h-8 w-8 text-zinc-400 hover:text-white"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeletingOrg(org)}
                        className="h-8 w-8 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
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

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={() => setModalOpen(false)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingOrg ? 'Edit Organization' : 'Create Organization'}</DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              {editingOrg
                ? 'Update organization details below.'
                : 'Create a new tenant organization in Flowlyx.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Organization Name</label>
              <Input
                placeholder="e.g. Acme Corp"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingOrg) {
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, ''),
                    );
                  }
                }}
                className="bg-zinc-950 border-zinc-800 text-sm text-zinc-200"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Slug</label>
              <Input
                placeholder="e.g. acme-corp"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-sm text-zinc-200 font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Description (Optional)</label>
              <Input
                placeholder="Brief description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-sm text-zinc-200"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {submitting ? 'Saving...' : editingOrg ? 'Save Changes' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deletingOrg} onOpenChange={() => setDeletingOrg(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-400">Delete Organization</DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Are you sure you want to delete{' '}
              <strong className="text-zinc-200">{deletingOrg?.name}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setDeletingOrg(null)}
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={submitting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {submitting ? 'Deleting...' : 'Delete Organization'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
