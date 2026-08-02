'use client';

import Image from 'next/image';
import { use, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWorkspace } from '@/features/workspaces/hooks/use-workspaces';
import { useRouter } from 'next/navigation';
import {
  useBoard,
  useDeleteBoard,
  useLists,
  useTasks,
  useCreateTask,
  useDeleteTask,
  useUpdateTask,
  usePriorities,
  useCreatePriority,
  useDeletePriority,
} from '@/features/boards/hooks/use-boards';
import { EditBoardForm } from '@/features/boards/components/edit-board-form';
import { TaskDetailModal } from '@/features/boards/components/task-detail-modal';
import { ProjectMembersDialog } from '@/features/projects/components/project-members-dialog';
import { useProjectMembers } from '@/features/projects/hooks/use-project-members';
import { getOrganizationById } from '@/features/organizations/api/organizations.api';
import { PrioritySummary } from '@/features/boards/types/board.types';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  ArrowLeft,
  Building2,
  Layers,
  Kanban,
  Plus,
  Trash2,
  Calendar,
  Edit2,
  LogOut,
  Sliders,
  ArrowUpDown,
  Menu,
  X,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { TaskResponse } from '@/features/boards/types/board.types';
import { useLogout } from '@/features/auth/hooks/use-logout';
import { useMe } from '@/features/profile/hooks/use-profile';
import { getUsers } from '@/features/admin/api/admin.api';
import { AdminUser } from '@/features/admin/types/admin.types';
import { toast } from 'sonner';

interface PageProps {
  params: Promise<{ slug: string; boardId: string }>;
}

function extractProjectId(b: unknown): string {
  if (!b || typeof b !== 'object') return '';
  const obj = b as Record<string, unknown>;
  if (typeof obj.project_id === 'string' && obj.project_id) return obj.project_id;
  if (typeof obj.projectId === 'string' && obj.projectId) return obj.projectId;
  if (obj.data && typeof obj.data === 'object') {
    const dataObj = obj.data as Record<string, unknown>;
    if (typeof dataObj.project_id === 'string' && dataObj.project_id) return dataObj.project_id;
    if (typeof dataObj.projectId === 'string' && dataObj.projectId) return dataObj.projectId;
  }
  return '';
}

export default function BoardDetailPage({ params }: PageProps) {
  const { slug, boardId } = use(params);
  const router = useRouter();
  const logoutMutation = useLogout();

  // Current logged in user profile & users list
  const { data: currentUser } = useMe();
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN';
  const { data: allUsers = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => getUsers().catch(() => []),
    enabled: !!isAdmin,
  });

  // Workspace & Org
  const { data: workspace, isLoading: isWorkspaceLoading } = useWorkspace(slug);
  const { data: organization } = useQuery({
    queryKey: ['organization', workspace?.organization_id],
    queryFn: () => getOrganizationById(workspace!.organization_id).catch(() => null),
    enabled: !!workspace?.organization_id,
  });

  // Board details
  const { data: board, isLoading: isBoardLoading, isError } = useBoard(boardId);
  const projectId = extractProjectId(board);
  const { data: projectMembersResp } = useProjectMembers(projectId);
  const projectMembers = Array.isArray(projectMembersResp)
    ? projectMembersResp
    : (projectMembersResp as unknown as { data?: unknown[] })?.data || [];
  const memberCount = Array.isArray(projectMembers) ? projectMembers.length : 0;

  const deleteBoardMutation = useDeleteBoard(projectId);
  const [isDeleteBoardAlertOpen, setIsDeleteBoardAlertOpen] = useState(false);
  const [isEditBoardModalOpen, setIsEditBoardModalOpen] = useState(false);
  const [isProjectMembersModalOpen, setIsProjectMembersModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lists (Columns)
  const { data: lists, isLoading: isListsLoading } = useLists(boardId);

  // Task & Priority Mutations
  const updateTaskMutation = useUpdateTask();
  const { data: prioritiesResp } = usePriorities(projectId);
  const boardPriorities = Array.isArray(prioritiesResp)
    ? prioritiesResp
    : (prioritiesResp as unknown as { data?: PrioritySummary[] })?.data || [];
  const createPriorityMutation = useCreatePriority(projectId);
  const deletePriorityMutation = useDeletePriority(projectId);

  // Local state for Manage Priorities Modal
  const [isPrioritiesModalOpen, setIsPrioritiesModalOpen] = useState(false);
  const [newPriorityName, setNewPriorityName] = useState('');
  const [newPriorityColor, setNewPriorityColor] = useState('#f97316');

  // Handle Drag & Drop move
  const handleMoveTask = (taskId: string, targetListId: string) => {
    updateTaskMutation.mutate({
      id: taskId,
      data: { listId: targetListId },
    });
  };

  if (isWorkspaceLoading || isBoardLoading || isListsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (isError || !board || !workspace) {
    return (
      <div className="min-h-dvh bg-zinc-950 text-zinc-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md flex flex-col items-center justify-center space-y-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center text-red-400">
          <p className="font-semibold text-white">Board not found</p>
          <Link
            href={`/workspaces/${slug}`}
            className="flex items-center text-sm font-semibold text-orange-500 hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Workspace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-50 flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Breadcrumb Links */}
          <div className="flex items-center gap-x-2 sm:gap-x-3 min-w-0">
            <Link href="/organizations" className="flex items-center gap-x-2 group shrink-0">
              <div>
                <Image src={'/Flowlyx.webp'} alt="Flowlyx" width={70} height={20} priority />
              </div>
            </Link>
            <span className="text-zinc-800 shrink-0">/</span>
            {organization && (
              <>
                <Link
                  href={`/organizations/${organization.slug}`}
                  className="hidden md:flex items-center gap-x-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors shrink-0 max-w-[100px] lg:max-w-none truncate"
                >
                  <Building2 className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                  <span className="truncate">{organization.name}</span>
                </Link>
                <span className="hidden md:inline text-zinc-800 shrink-0">/</span>
              </>
            )}
            <Link
              href={`/workspaces/${slug}`}
              className="hidden sm:flex items-center gap-x-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors shrink-0 max-w-[120px] lg:max-w-none truncate"
            >
              <Layers className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
              <span className="truncate">{workspace.name}</span>
            </Link>
            <span className="hidden sm:inline text-zinc-800 shrink-0">/</span>
            <div className="flex items-center gap-x-1.5 text-sm text-zinc-200 font-semibold truncate">
              <Kanban className="h-3.5 w-3.5 text-orange-500 shrink-0" />
              <span className="truncate">{board.name}</span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-x-2 sm:gap-x-4">
            <NotificationBell />

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-x-4">
              <Link
                href={`/workspaces/${slug}`}
                className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                Back to Dashboard
              </Link>
              <button
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
              >
                <LogOut className="mr-1 h-3.5 w-3.5" />
                Logout
              </button>
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-1.5 text-zinc-400 hover:text-white rounded-lg bg-zinc-900 border border-zinc-850 cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-zinc-900 bg-zinc-950 p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <Link
              href={`/workspaces/${slug}`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 rounded-lg transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4 text-zinc-400" />
              Back to Dashboard ({workspace.name})
            </Link>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                logoutMutation.mutate();
              }}
              disabled={logoutMutation.isPending}
              className="w-full flex items-center px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Main Board View Container */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden min-h-[calc(100vh-4rem)]">
        {/* Title area */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 sm:pb-6 border-b border-zinc-900 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {board.name}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              {board.description || 'Manage tasks, backlog, and sprint pipeline.'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <Button
              onClick={() => setIsProjectMembersModalOpen(true)}
              variant="ghost"
              size="sm"
              className="border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs"
            >
              <Users className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
              Members ({memberCount})
            </Button>
            {isAdmin && (
              <>
                <Button
                  onClick={() => setIsEditBoardModalOpen(true)}
                  variant="ghost"
                  size="sm"
                  className="border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs flex-1 sm:flex-initial"
                >
                  <Edit2 className="h-3.5 w-3.5 mr-1.5 text-orange-500" />
                  Edit Board
                </Button>
                <Button
                  onClick={() => setIsDeleteBoardAlertOpen(true)}
                  variant="ghost"
                  size="sm"
                  className="border border-zinc-800 bg-zinc-900/60 hover:bg-red-500/10 text-zinc-300 hover:text-red-400 rounded-xl text-xs flex-1 sm:flex-initial"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5 text-red-500" />
                  Delete Board
                </Button>
              </>
            )}
            <Button
              onClick={() => setIsPrioritiesModalOpen(true)}
              variant="ghost"
              size="sm"
              className="border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs flex-1 sm:flex-initial"
            >
              <Sliders className="h-3.5 w-3.5 mr-1.5 text-orange-500" />
              Manage Priorities
            </Button>
          </div>
        </div>

        {/* Kanban Board columns wrapper */}
        <div className="flex-1 flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none pb-4 items-start select-none touch-pan-x min-w-full">
          {(() => {
            const FIXED_ORDER = ['to do', 'in progress', 'completed'];
            const sortedLists = lists
              ? [...lists].sort((a, b) => {
                  const indexA = FIXED_ORDER.indexOf(a.name.toLowerCase());
                  const indexB = FIXED_ORDER.indexOf(b.name.toLowerCase());
                  if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                  if (indexA !== -1) return -1;
                  if (indexB !== -1) return 1;
                  return (a.order ?? 0) - (b.order ?? 0);
                })
              : [];
            const todoList =
              sortedLists.find((l) => l.name.toLowerCase() === 'to do') || sortedLists[0];

            return sortedLists.map((list) => (
              <BoardColumn
                key={list.id}
                list={list}
                boardId={boardId}
                projectId={projectId}
                todoListId={todoList?.id}
                currentUser={currentUser}
                allUsers={allUsers}
                onMoveTask={handleMoveTask}
              />
            ));
          })()}
        </div>

        {/* Manage Priorities Dialog */}
        <Dialog open={isPrioritiesModalOpen} onOpenChange={setIsPrioritiesModalOpen}>
          <DialogContent className="max-w-md bg-zinc-950 border-zinc-900 text-zinc-50 rounded-2xl">
            <DialogHeader className="text-left space-y-1">
              <DialogTitle className="text-xl font-bold text-white tracking-tight flex items-center gap-x-2">
                <Sliders className="h-5 w-5 text-orange-500" />
                Manage Project Priorities
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                Configure custom priority levels for tasks in this project.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 pt-2">
              {/* Create New Priority Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newPriorityName.trim()) return;
                  const targetProjectId = extractProjectId(board) || projectId;
                  createPriorityMutation.mutate(
                    {
                      projectId: targetProjectId,
                      name: newPriorityName.trim(),
                      color: newPriorityColor,
                    },
                    {
                      onSuccess: () => {
                        setNewPriorityName('');
                      },
                    },
                  );
                }}
                className="space-y-3 bg-zinc-900/30 border border-zinc-900 rounded-xl p-4"
              >
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Add Custom Priority
                </span>
                <div className="flex gap-x-2">
                  <Input
                    placeholder="Priority name (e.g. Blocker)..."
                    value={newPriorityName}
                    onChange={(e) => setNewPriorityName(e.target.value)}
                    className="flex-1 border-zinc-800 bg-zinc-900/60 text-zinc-100 text-xs"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={createPriorityMutation.isPending}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 rounded-xl"
                  >
                    {createPriorityMutation.isPending ? 'Adding...' : 'Add'}
                  </Button>
                </div>
                <div className="flex items-center gap-x-2 pt-1">
                  <span className="text-xs text-zinc-400 font-medium">Color:</span>
                  {[
                    '#ef4444',
                    '#f97316',
                    '#eab308',
                    '#22c55e',
                    '#3b82f6',
                    '#a855f7',
                    '#ec4899',
                  ].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewPriorityColor(c)}
                      className={`h-5 w-5 rounded-full border transition-all ${
                        newPriorityColor === c
                          ? 'border-white scale-110 shadow-md'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </form>

              {/* Priority List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Active Priorities ({boardPriorities.length})
                </span>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {boardPriorities.map((p) => {
                    const isDefault =
                      ['urgent', 'high', 'medium', 'low'].includes(p.name.toLowerCase()) &&
                      !p.createdBy;
                    const canDelete =
                      !isDefault &&
                      (p.createdBy === currentUser?.id || currentUser?.role === 'SUPER_ADMIN');

                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-900"
                      >
                        <div className="flex items-center gap-x-2.5">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: p.color }}
                          />
                          <span className="text-sm font-semibold text-zinc-200">{p.name}</span>
                          {isDefault && (
                            <span className="text-2xs font-medium px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                              System Default
                            </span>
                          )}
                        </div>
                        {canDelete ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePriorityMutation.mutate(p.id)}
                            disabled={deletePriorityMutation.isPending}
                            className="h-7 w-7 p-0 text-zinc-500 hover:text-red-400 hover:bg-zinc-800"
                            title="Delete custom priority"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Board Dialog */}
        <Dialog open={isEditBoardModalOpen} onOpenChange={setIsEditBoardModalOpen}>
          <DialogContent className="max-w-md bg-zinc-950 border-zinc-900 text-zinc-50 rounded-2xl">
            <DialogHeader className="text-left space-y-1">
              <DialogTitle className="text-xl font-bold text-white tracking-tight">
                Edit Board
              </DialogTitle>
              <DialogDescription className="text-sm text-zinc-400">
                Update board name and description.
              </DialogDescription>
            </DialogHeader>
            {board && (
              <EditBoardForm
                board={board}
                projectId={projectId}
                onSuccess={() => setIsEditBoardModalOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Board Alert Dialog */}
        <AlertDialog open={isDeleteBoardAlertOpen} onOpenChange={setIsDeleteBoardAlertOpen}>
          <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 rounded-2xl max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-400 font-bold">Delete Board</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400 text-xs">
                Are you sure you want to delete <strong className="text-zinc-200">{board.name}</strong>? All lists and tasks inside will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl text-xs">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  deleteBoardMutation.mutate(boardId, {
                    onSuccess: () => router.push(`/workspaces/${slug}`),
                  });
                }}
                className="bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs"
              >
                Delete Board
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Project Members Dialog */}
        {Boolean(projectId && workspace) && (
          <ProjectMembersDialog
            projectId={projectId}
            workspaceId={workspace!.id}
            projectName={board?.name || ''}
            open={isProjectMembersModalOpen}
            onOpenChange={setIsProjectMembersModalOpen}
          />
        )}
      </main>
    </div>
  );
}

/* Isolated Column Component to handle tasks fetching and local state */
interface BoardColumnProps {
  list: { id: string; name: string };
  boardId: string;
  projectId: string;
  todoListId?: string;
  currentUser?: { id: string; role?: string } | null;
  allUsers?: AdminUser[];
  onMoveTask: (taskId: string, targetListId: string) => void;
}

function BoardColumn({
  list,
  boardId,
  projectId,
  todoListId,
  currentUser,
  allUsers,
  onMoveTask,
}: BoardColumnProps) {
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN';
  const { data: projectMembersResp } = useProjectMembers(projectId);
  const assignableUsers = useMemo(() => {
    const pms = Array.isArray(projectMembersResp)
      ? projectMembersResp
      : (projectMembersResp as unknown as { data?: unknown[] })?.data || [];
    return (pms as Array<{ user?: AdminUser }>)
      .map((pm) => pm.user)
      .filter(Boolean) as AdminUser[];
  }, [projectMembersResp]);

  const { data: tasks, isLoading } = useTasks(list.id);
  const { data: prioritiesResp } = usePriorities(projectId);
  const priorities = useMemo(
    () =>
      Array.isArray(prioritiesResp)
        ? prioritiesResp
        : (prioritiesResp as unknown as { data?: PrioritySummary[] })?.data || [],
    [prioritiesResp],
  );

  type SortOption = 'date-desc' | 'date-asc' | 'priority-desc' | 'priority-asc';
  const [columnSortBy, setColumnSortBy] = useState<SortOption>('date-desc');
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const getPriorityRank = (pName?: string) => {
    if (!pName) return 0;
    const name = pName.toLowerCase();
    if (name === 'urgent') return 4;
    if (name === 'high') return 3;
    if (name === 'medium') return 2;
    if (name === 'low') return 1;
    return 0.5;
  };

  const sortedTasks = useMemo(() => {
    if (!tasks) return [];
    return [...tasks].sort((a, b) => {
      if (columnSortBy === 'date-desc') {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      }
      if (columnSortBy === 'date-asc') {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeA - timeB;
      }
      const pIdA = a.priorityId || (a as unknown as { priority_id?: string })?.priority_id;
      const pIdB = b.priorityId || (b as unknown as { priority_id?: string })?.priority_id;
      const pA = priorities.find((p) => p.id === pIdA);
      const pB = priorities.find((p) => p.id === pIdB);
      const rankA = getPriorityRank(pA?.name);
      const rankB = getPriorityRank(pB?.name);

      if (columnSortBy === 'priority-desc') {
        return rankB - rankA;
      }
      if (columnSortBy === 'priority-asc') {
        return rankA - rankB;
      }
      return 0;
    });
  }, [tasks, columnSortBy, priorities]);

  const createTaskMutation = useCreateTask(boardId, todoListId || list.id);
  const deleteTaskMutation = useDeleteTask(list.id);

  const [isOpen, setIsOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriorityId, setTaskPriorityId] = useState('');
  const [taskAssigneeId, setTaskAssigneeId] = useState('');
  const [taskStartDate, setTaskStartDate] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

  // Task detail dialog state
  const [activeTask, setActiveTask] = useState<TaskResponse | null>(null);

  const canUserMoveTask = (t: TaskResponse) => {
    if (isAdmin) return true;
    return t.taskAssignments?.some((a) => a.userId === currentUser?.id);
  };

  const handleOpenDetails = (task: TaskResponse) => {
    setActiveTask(task);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    if (!isAdmin) {
      toast.error('Hanya Admin yang dapat membuat task baru');
      return;
    }

    createTaskMutation.mutate(
      {
        listId: todoListId || list.id,
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        priorityId: taskPriorityId && taskPriorityId !== 'none' ? taskPriorityId : undefined,
        startDate: taskStartDate ? new Date(taskStartDate).toISOString() : undefined,
        dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : undefined,
        assigneeId: taskAssigneeId && taskAssigneeId !== 'none' ? taskAssigneeId : undefined,
      },
      {
        onSuccess: () => {
          setTaskTitle('');
          setTaskDesc('');
          setTaskPriorityId('');
          setTaskAssigneeId('');
          setTaskStartDate('');
          setTaskDueDate('');
          setIsOpen(false);
          toast.success('Task berhasil dibuat dan dimasukkan ke kolom To Do');
        },
      },
    );
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const taskId = e.dataTransfer.getData('text/plain');
        if (taskId) {
          onMoveTask(taskId, list.id);
        }
      }}
      className="w-[280px] sm:w-72 shrink-0 flex flex-col max-h-[calc(100vh-12rem)] bg-gradient-to-b from-zinc-900/40 to-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 space-y-4 backdrop-blur-sm shadow-xl"
    >
      {/* Column Header - Fixed Column with Sorting */}
      <div className="flex items-center justify-between pb-1 border-b border-zinc-850/60">
        <div className="flex items-center gap-x-2">
          <h3 className="text-sm font-bold text-white tracking-tight">{list.name}</h3>
          <span className="text-2xs text-orange-400 font-bold bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
            {sortedTasks.length}
          </span>
        </div>
        <div className="flex items-center">
          <Select value={columnSortBy} onValueChange={(val) => setColumnSortBy(val as SortOption)}>
            <SelectTrigger
              className="h-6 w-6 p-0 border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md flex items-center justify-center focus:ring-0 focus:ring-offset-0 cursor-pointer shadow-none [&>svg:last-child]:hidden"
              title="Sort tasks"
            >
              <ArrowUpDown className="h-3 w-3 text-orange-500" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-900 text-zinc-50 text-xs">
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="priority-desc">Priority: High to Low</SelectItem>
              <SelectItem value="priority-asc">Priority: Low to High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-[50px] pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
          </div>
        ) : sortedTasks && sortedTasks.length > 0 ? (
          sortedTasks.map((task) => {
            const targetPId =
              task.priorityId || (task as unknown as { priority_id?: string })?.priority_id;
            const taskPriority = priorities.find((p) => p.id === targetPId);
            const userCanMove = canUserMoveTask(task);
            const assignedUser = task.taskAssignments?.[0]?.user;

            return (
              <div
                key={task.id}
                draggable={userCanMove}
                onDragStart={(e) => {
                  if (!userCanMove) {
                    e.preventDefault();
                    toast.error(
                      'Hanya Admin dan User yang di-assign pada task ini yang dapat memindahkannya',
                    );
                    return;
                  }
                  e.dataTransfer.setData('text/plain', task.id);
                }}
                onClick={() => handleOpenDetails(task)}
                className={`group border rounded-xl p-4 space-y-2 transition-all shadow-sm ${
                  userCanMove
                    ? 'cursor-grab active:cursor-grabbing'
                    : 'cursor-not-allowed opacity-80'
                } ${
                  task.status === 'ARCHIVED'
                    ? 'bg-zinc-950/80 border-zinc-900 opacity-50'
                    : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-900/80 hover:border-zinc-800'
                }`}
              >
                <div className="flex items-start justify-between gap-x-2">
                  <span className="text-sm font-medium text-zinc-100 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                    {task.title}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTaskToDelete(task.id);
                      }}
                      className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {taskPriority && (
                    <span
                      className="inline-flex items-center text-3xs font-semibold px-2 py-0.5 rounded border"
                      style={{
                        backgroundColor: `${taskPriority.color}15`,
                        color: taskPriority.color,
                        borderColor: `${taskPriority.color}30`,
                      }}
                    >
                      {taskPriority.name}
                    </span>
                  )}
                  {task.dueDate && (
                    <div className="flex items-center gap-x-1 text-3xs font-semibold text-zinc-400">
                      <Calendar className="h-2.5 w-2.5" />
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {assignedUser && (
                  <div className="flex items-center gap-x-1.5 mt-2 pt-2 border-t border-zinc-800/50">
                    <div className="h-5 w-5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-3xs font-bold uppercase shrink-0">
                      {(assignedUser.name || assignedUser.email || 'U')[0]}
                    </div>
                    <span className="text-3xs font-medium text-zinc-300 truncate">
                      {assignedUser.name || assignedUser.email}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-xs text-zinc-600">No tasks</div>
        )}
      </div>

      {/* Add Task Trigger Button - ADMIN ONLY */}
      {isAdmin && (
        <Button
          onClick={() => setIsOpen(true)}
          variant="ghost"
          size="sm"
          className="w-full text-zinc-400 hover:text-white justify-start gap-x-1.5 px-2 hover:bg-zinc-900/50 rounded-xl"
        >
          <Plus className="h-4 w-4 text-orange-500" />
          <span className="text-xs font-semibold">New Task</span>
        </Button>
      )}

      {/* Create Task Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md bg-zinc-950 border-zinc-900 text-zinc-50 rounded-2xl">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-xl font-bold text-white tracking-tight">
              New Task
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Create a new task (will automatically be placed in &quot;To Do&quot;).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="flex flex-col gap-y-1.5">
              <Label
                htmlFor="task-title"
                className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
              >
                Title
              </Label>
              <Input
                id="task-title"
                required
                placeholder="Finish login tests..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full border-zinc-800 bg-zinc-900/50 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-orange-500"
              />
            </div>
            <div className="flex flex-col gap-y-1.5">
              <Label
                htmlFor="task-desc"
                className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
              >
                Description
              </Label>
              <Textarea
                id="task-desc"
                placeholder="Detailed explanation of task..."
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                className="w-full border-zinc-800 bg-zinc-900/50 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-orange-500 min-h-[80px]"
              />
            </div>

            <div className="flex flex-col gap-y-1.5">
              <Label
                htmlFor="task-assignee"
                className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
              >
                Assignee User
              </Label>
              <Select value={taskAssigneeId} onValueChange={(val) => setTaskAssigneeId(val || '')}>
                <SelectTrigger
                  id="task-assignee"
                  className="w-full border-zinc-800 bg-zinc-900/50 text-zinc-100"
                >
                  <SelectValue placeholder="Select user to assign">
                    {(() => {
                      if (!taskAssigneeId || taskAssigneeId === 'none') return 'Unassigned';
                      const selectedUser = allUsers?.find((u) => u.id === taskAssigneeId);
                      return selectedUser ? selectedUser.name || selectedUser.email : 'Select user';
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-900 text-zinc-50">
                  <SelectItem value="none" label="Unassigned">
                    Unassigned
                  </SelectItem>
                  {allUsers?.map((u) => (
                    <SelectItem key={u.id} value={u.id} label={u.name || u.email}>
                      <span className="flex items-center justify-between w-full gap-x-2">
                        <span>{u.name || u.email}</span>
                        <span className="text-3xs text-orange-400 font-mono">({u.role})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-y-1.5">
              <Label
                htmlFor="task-priority"
                className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
              >
                Priority
              </Label>
              <Select value={taskPriorityId} onValueChange={(val) => setTaskPriorityId(val || '')}>
                <SelectTrigger
                  id="task-priority"
                  className="w-full border-zinc-800 bg-zinc-900/50 text-zinc-100"
                >
                  <SelectValue placeholder="Select priority">
                    {(() => {
                      if (!taskPriorityId || taskPriorityId === 'none') return 'None';
                      const selected = priorities.find((p) => p.id === taskPriorityId);
                      if (!selected) return 'Select priority';
                      return (
                        <span className="flex items-center gap-x-2">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: selected.color }}
                          />
                          <span>{selected.name}</span>
                        </span>
                      );
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-900 text-zinc-50">
                  <SelectItem value="none" label="None">
                    None
                  </SelectItem>
                  {priorities.map((p) => (
                    <SelectItem key={p.id} value={p.id} label={p.name}>
                      <span className="flex items-center gap-x-2">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: p.color }}
                        />
                        <span>{p.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-y-1.5">
                <Label
                  htmlFor="task-start-date"
                  className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                >
                  Start Date
                </Label>
                <Input
                  id="task-start-date"
                  type="date"
                  value={taskStartDate}
                  onChange={(e) => setTaskStartDate(e.target.value)}
                  className="w-full border-zinc-800 bg-zinc-900/50 text-zinc-100 text-xs [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-y-1.5">
                <Label
                  htmlFor="task-due-date"
                  className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                >
                  Due Date
                </Label>
                <Input
                  id="task-due-date"
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full border-zinc-800 bg-zinc-900/50 text-zinc-100 text-xs [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={createTaskMutation.isPending}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-xl"
            >
              {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Task Alert Dialog */}
      <AlertDialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
        <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400 font-bold">Delete Task</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400 text-xs">
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setTaskToDelete(null)}
              className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl text-xs"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (taskToDelete) {
                  deleteTaskMutation.mutate(taskToDelete);
                  setTaskToDelete(null);
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs"
            >
              Delete Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Task Details Modal (Subtasks, Comments, Attachments, Assignments, Labels) */}
      <TaskDetailModal
        task={activeTask}
        projectId={projectId}
        priorities={priorities}
        allUsers={assignableUsers}
        currentUser={currentUser}
        onClose={() => setActiveTask(null)}
      />
    </div>
  );
}
