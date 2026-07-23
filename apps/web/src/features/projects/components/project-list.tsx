'use client';

import { useState } from 'react';
import { useProjects } from '../hooks/use-projects';
import { CreateProjectForm } from './create-project-form';
import { Loader2, Plus, FolderKanban, Briefcase, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProjectListProps {
  workspaceId: string;
  onSelectProject?: (projectId: string) => void;
}

export function ProjectList({ workspaceId, onSelectProject }: ProjectListProps) {
  const { data: projects, isLoading, isError, error } = useProjects(workspaceId);
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
        <p className="font-semibold text-white">Failed to load projects</p>
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
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Projects</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Manage project delivery zones, release packages, and repositories.
          </p>
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          New Project
        </Button>
      </div>

      {!projects || projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-6 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/10 p-16 text-center">
          <div className="rounded-2xl bg-zinc-900/50 p-4 border border-zinc-800">
            <FolderKanban className="h-8 w-8 text-zinc-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No projects created</h3>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto">
              Get started by creating your first project zone in this workspace.
            </p>
          </div>
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all cursor-pointer"
          >
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject?.(project.id)}
              className="group relative flex flex-col justify-between h-44 rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 transition-all hover:border-orange-500/50 hover:bg-zinc-900/40 hover:shadow-[0_0_30px_rgba(249,115,22,0.04)] cursor-pointer"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-x-2.5">
                    <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-zinc-400 group-hover:text-orange-500 group-hover:border-orange-500/30 transition-colors duration-300">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-white tracking-tight group-hover:text-orange-500 transition-colors">
                      {project.name}
                    </h3>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-orange-500/10 px-2 py-0.5 text-2xs font-semibold text-orange-500 ring-1 ring-orange-500/20">
                    {project.status}
                  </span>
                </div>
                {project.description && (
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                    {project.description}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between text-2xs font-semibold text-zinc-500 mt-4 border-t border-zinc-900/60 pt-3">
                <span className="font-mono">/{project.slug}</span>
                <span className="inline-flex items-center gap-x-1 text-zinc-400">
                  <Calendar className="h-3 w-3" />
                  Active Zone
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md bg-zinc-950 border-zinc-900 text-zinc-50 rounded-2xl">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-xl font-bold text-white tracking-tight">
              Create Project
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-400">
              Add a new project zone to organize your boards, epics, and tasks.
            </DialogDescription>
          </DialogHeader>
          <CreateProjectForm workspaceId={workspaceId} onSuccess={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
