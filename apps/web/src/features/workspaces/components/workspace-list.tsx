'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWorkspaces } from '../hooks/use-workspaces';
import { CreateWorkspaceForm } from './create-workspace-form';
import { Loader2, Plus, FolderKanban, X, ArrowRight, Kanban } from 'lucide-react';
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
      <div className="flex h-64 flex-col items-center justify-center space-y-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center text-red-400">
        <p className="font-semibold text-white">Failed to load workspaces</p>
        <p className="text-sm text-zinc-400">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Workspaces</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Manage projects, boards, and tasks inside this workspace zone.
          </p>
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          New Workspace
        </Button>
      </div>

      {!workspaces || workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-6 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/10 p-16 text-center">
          <div className="rounded-2xl bg-zinc-900/50 p-4 border border-zinc-800">
            <FolderKanban className="h-8 w-8 text-zinc-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No workspaces found</h3>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto">
              Create your first workspace to start organizing projects, sprints, and Kanban boards.
            </p>
          </div>
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all cursor-pointer"
          >
            Create Workspace
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((space) => (
            <Link
              key={space.id}
              href={`/workspaces/${space.slug}`}
              className="group relative flex flex-col justify-between h-40 rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 transition-all hover:border-orange-500/50 hover:bg-zinc-900/40 hover:shadow-[0_0_30px_rgba(249,115,22,0.04)]"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-x-2.5">
                    <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-zinc-400 group-hover:text-orange-500 group-hover:border-orange-500/30 transition-colors duration-300">
                      <Kanban className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-white tracking-tight group-hover:text-orange-500 transition-colors">
                      {space.name}
                    </h3>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-orange-500/10 px-2 py-0.5 text-2xs font-semibold text-orange-500 ring-1 ring-orange-500/20">
                    {space.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-2xs font-semibold text-zinc-500 mt-4 border-t border-zinc-900/60 pt-3">
                <span>/{space.slug}</span>
                <span className="inline-flex items-center gap-x-1 text-zinc-400 group-hover:text-white transition-colors">
                  Open Board
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-900 bg-zinc-950 p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-6 space-y-1">
              <h2 className="text-xl font-bold text-white tracking-tight">Create Workspace</h2>
              <p className="text-sm text-zinc-400">
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
