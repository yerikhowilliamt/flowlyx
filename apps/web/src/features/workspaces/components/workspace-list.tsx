'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWorkspaces } from '../hooks/use-workspaces';
import { CreateWorkspaceForm } from './create-workspace-form';
import { Loader2, Plus, FolderKanban, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkspaceListProps {
  organizationId: string;
}

export function WorkspaceList({ organizationId }: WorkspaceListProps) {
  const { data: workspaces, isLoading, isError, error } = useWorkspaces(organizationId);
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-xl border border-destructive/50 bg-destructive/10 p-8 text-center text-destructive">
        <p className="font-medium">Failed to load workspaces</p>
        <p className="text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Workspaces</h2>
          <p className="text-muted-foreground">
            Manage workspaces and boards inside this organization.
          </p>
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Workspace
        </Button>
      </div>

      {!workspaces || workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border border-dashed border-zinc-800 p-12 text-center bg-zinc-900/50">
          <div className="rounded-full bg-zinc-900 p-4 border border-zinc-800">
            <FolderKanban className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium text-white">No workspaces found</h3>
            <p className="text-sm text-muted-foreground">
              Create your first workspace to start organizing projects and boards.
            </p>
          </div>
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
          >
            Create Workspace
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((space) => (
            <Link
              key={space.id}
              href={`/workspaces/${space.slug}`}
              className="flex flex-col space-y-2 rounded-xl border border-zinc-800 bg-zinc-900 p-6 transition-colors hover:border-orange-500 hover:bg-zinc-800/50"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{space.name}</h3>
                <span className="inline-flex items-center rounded-full bg-orange-500/10 px-2 py-1 text-xs font-medium text-orange-500 ring-1 ring-orange-500/20 ring-inset">
                  {space.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">/{space.slug}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white">Create Workspace</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Add a new workspace to organize your projects and boards.
              </p>
            </div>
            <CreateWorkspaceForm
              organizationId={organizationId}
              onSuccess={() => setIsOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
