'use client';

import { useState } from 'react';
import { useBoards } from '../hooks/use-boards';
import { CreateBoardForm } from './create-board-form';
import { ProjectSummary } from '@/features/projects/types/project.types';
import { Loader2, Plus, Kanban, Layout, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';

interface BoardListProps {
  projects: ProjectSummary[];
  workspaceSlug: string;
  selectedProjectId?: string;
  onSelectProject?: (projectId: string) => void;
}

export function BoardList({
  projects,
  workspaceSlug,
  selectedProjectId: controlledProjectId,
  onSelectProject,
}: BoardListProps) {
  const [internalSelectedProjectId, setInternalSelectedProjectId] = useState<string>('');

  const selectedProjectId =
    controlledProjectId !== undefined ? controlledProjectId : internalSelectedProjectId;
  const setSelectedProjectId = (id: string) => {
    if (onSelectProject) {
      onSelectProject(id);
    }
    setInternalSelectedProjectId(id);
  };
  const [isOpen, setIsOpen] = useState(false);

  const activeProjectId =
    selectedProjectId || (projects && projects.length > 0 ? projects[0].id : '');

  const { data: boards, isLoading, isError, error } = useBoards(activeProjectId);

  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/10 p-16 text-center">
        <div className="rounded-2xl bg-zinc-900/50 p-4 border border-zinc-800">
          <AlertCircle className="h-8 w-8 text-zinc-500" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white">No projects found</h3>
          <p className="text-sm text-zinc-400 max-w-sm mx-auto">
            You need to create at least one project zone before you can manage sprint boards.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Sprint Boards</h2>
          <p className="text-sm text-zinc-400">
            Sprint boards help teams manage task pipelines, backlog, and sprint lanes.
          </p>
        </div>
        {activeProjectId && (
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New Board
          </Button>
        )}
      </div>

      {/* Project Selector */}
      <div className="flex flex-col gap-y-1.5 max-w-xs">
        <Label
          htmlFor="project-select"
          className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
        >
          Filter by Project
        </Label>
        <Select value={activeProjectId} onValueChange={(val) => setSelectedProjectId(val || '')}>
          <SelectTrigger
            id="project-select"
            className="w-full border-zinc-800 bg-zinc-900/40 text-zinc-100"
          >
            <SelectValue placeholder="Select a project">
              {projects.find((p) => p.id === activeProjectId)?.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-zinc-950 border-zinc-900 text-zinc-50">
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : isError ? (
        <div className="flex h-48 flex-col items-center justify-center space-y-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center text-red-400">
          <p className="font-semibold text-white">Failed to load boards</p>
          <p className="text-sm text-zinc-400">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      ) : !boards || boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-6 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/10 p-16 text-center">
          <div className="rounded-2xl bg-zinc-900/50 p-4 border border-zinc-800">
            <Kanban className="h-8 w-8 text-zinc-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No sprint boards created</h3>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto">
              Create a sprint board to begin mapping out task lanes for this project.
            </p>
          </div>
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all cursor-pointer"
          >
            Create Board
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <Link
              key={board.id}
              href={`/workspaces/${workspaceSlug}/boards/${board.id}`}
              className="group relative flex flex-col justify-between h-36 rounded-2xl border border-zinc-900 bg-zinc-900/20 p-6 transition-all hover:border-orange-500/50 hover:bg-zinc-900/40 hover:shadow-[0_0_30px_rgba(249,115,22,0.04)] cursor-pointer"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-x-2.5">
                    <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-zinc-400 group-hover:text-orange-500 group-hover:border-orange-500/30 transition-colors duration-300">
                      <Layout className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-white tracking-tight group-hover:text-orange-500 transition-colors">
                      {board.name}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-2xs font-semibold text-zinc-500 mt-4 border-t border-zinc-900/60 pt-3">
                <span className="inline-flex items-center gap-x-1 text-zinc-400">
                  Status: {board.status}
                </span>
                <span className="flex items-center text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Open Board <ChevronRight className="ml-0.5 h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md bg-zinc-950 border-zinc-900 text-zinc-50 rounded-2xl">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-xl font-bold text-white tracking-tight">
              Create Board
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-400">
              Create a new Kanban board to track sprints, tasks, and columns.
            </DialogDescription>
          </DialogHeader>
          {activeProjectId && (
            <CreateBoardForm projectId={activeProjectId} onSuccess={() => setIsOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
