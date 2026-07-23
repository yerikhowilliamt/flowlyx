'use client';

import Image from 'next/image';
import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWorkspace } from '@/features/workspaces/hooks/use-workspaces';
import {
  useBoard,
  useLists,
  useCreateList,
  useDeleteList,
  useUpdateList,
  useTasks,
  useCreateTask,
  useDeleteTask,
  useUpdateTask,
  usePriorities,
} from '@/features/boards/hooks/use-boards';
import { getOrganizationById } from '@/features/organizations/api/organizations.api';
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
  CheckCircle,
  Calendar,
  X,
  Edit2,
} from 'lucide-react';
import Link from 'next/link';
import { TaskResponse } from '@/features/boards/types/board.types';

interface PageProps {
  params: Promise<{ slug: string; boardId: string }>;
}

export default function BoardDetailPage({ params }: PageProps) {
  const { slug, boardId } = use(params);

  // Workspace & Org
  const { data: workspace, isLoading: isWorkspaceLoading } = useWorkspace(slug);
  const { data: organization } = useQuery({
    queryKey: ['organization', workspace?.organization_id],
    queryFn: () => getOrganizationById(workspace!.organization_id),
    enabled: !!workspace?.organization_id,
  });

  // Board details
  const { data: board, isLoading: isBoardLoading, isError } = useBoard(boardId);

  // Lists (Columns)
  const { data: lists, isLoading: isListsLoading } = useLists(boardId);
  const createListMutation = useCreateList(boardId);
  const updateListMutation = useUpdateList(boardId);
  const deleteListMutation = useDeleteList(boardId);

  // Task Mutations
  const updateTaskMutation = useUpdateTask();

  // Local state for list creation
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState('');

  // Handle Drag & Drop move
  const handleMoveTask = (taskId: string, targetListId: string) => {
    updateTaskMutation.mutate({
      id: taskId,
      data: { listId: targetListId },
    });
  };

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    createListMutation.mutate(
      {
        boardId,
        name: newListName.trim(),
      },
      {
        onSuccess: () => {
          setNewListName('');
          setIsAddingList(false);
        },
      },
    );
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
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-x-3">
            <Link href="/organizations" className="flex items-center gap-x-2 group">
              <div>
                <Image src={'/Flowlyx.webp'} alt="Flowlyx" width={90} height={26} priority />
              </div>
            </Link>
            <span className="text-zinc-800">/</span>
            {organization && (
              <>
                <Link
                  href={`/organizations/${organization.slug}`}
                  className="flex items-center gap-x-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <Building2 className="h-3.5 w-3.5 text-zinc-500" />
                  <span>{organization.name}</span>
                </Link>
                <span className="text-zinc-800">/</span>
              </>
            )}
            <Link
              href={`/workspaces/${slug}`}
              className="flex items-center gap-x-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <Layers className="h-3.5 w-3.5 text-zinc-500" />
              <span>{workspace.name}</span>
            </Link>
            <span className="text-zinc-800">/</span>
            <div className="flex items-center gap-x-1.5 text-sm text-zinc-200 font-semibold">
              <Kanban className="h-3.5 w-3.5 text-orange-500" />
              <span>{board.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-x-4">
            <NotificationBell />
            <Link
              href={`/workspaces/${slug}`}
              className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Board View Container */}
      <main className="flex-1 flex flex-col p-6 overflow-hidden min-h-[calc(100vh-4rem)]">
        {/* Title area */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-900 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{board.name}</h1>
            <p className="text-xs text-zinc-400 mt-1">
              {board.description || 'Manage tasks, backlog, and sprint pipeline.'}
            </p>
          </div>
        </div>

        {/* Kanban Board columns wrapper */}
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4 items-start select-none">
          {lists?.map((list) => (
            <BoardColumn
              key={list.id}
              list={list}
              boardId={boardId}
              projectId={board.project_id}
              onMoveTask={handleMoveTask}
              onDeleteList={() => deleteListMutation.mutate(list.id)}
              onUpdateList={(newName) =>
                updateListMutation.mutate({ id: list.id, data: { name: newName } })
              }
            />
          ))}

          {/* Add Column Button / Form */}
          <div className="w-72 shrink-0 bg-zinc-900/10 border border-dashed border-zinc-800 rounded-2xl p-4 transition-all hover:bg-zinc-900/20">
            {isAddingList ? (
              <form onSubmit={handleCreateList} className="space-y-3">
                <Input
                  autoFocus
                  type="text"
                  placeholder="Column title..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="border-zinc-800 bg-zinc-950 text-sm focus-visible:ring-1 focus-visible:ring-orange-500"
                />
                <div className="flex items-center gap-x-2">
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                  >
                    Add Column
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddingList(false)}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingList(true)}
                className="w-full flex items-center justify-center gap-x-2 py-2 text-sm text-zinc-400 hover:text-orange-500 transition-colors font-semibold"
              >
                <Plus className="h-4 w-4" />
                Add Column
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* Isolated Column Component to handle tasks fetching and local state */
interface BoardColumnProps {
  list: { id: string; name: string };
  boardId: string;
  projectId: string;
  onMoveTask: (taskId: string, targetListId: string) => void;
  onDeleteList: () => void;
  onUpdateList: (newName: string) => void;
}

function BoardColumn({
  list,
  boardId,
  projectId,
  onMoveTask,
  onDeleteList,
  onUpdateList,
}: BoardColumnProps) {
  const { data: tasks, isLoading } = useTasks(list.id);
  const { data: prioritiesResp } = usePriorities(projectId);
  const priorities = prioritiesResp?.data || [];

  const createTaskMutation = useCreateTask(boardId, list.id);
  const deleteTaskMutation = useDeleteTask(list.id);
  const updateTaskMutation = useUpdateTask();

  const [isOpen, setIsOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriorityId, setTaskPriorityId] = useState('');
  const [taskStartDate, setTaskStartDate] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(list.name);

  // Task detail dialog state
  const [activeTask, setActiveTask] = useState<TaskResponse | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriorityId, setEditPriorityId] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [isEditingTask, setIsEditingTask] = useState(false);

  const handleOpenDetails = (task: TaskResponse) => {
    setActiveTask(task);
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditPriorityId(task.priorityId || 'none');
    setEditStartDate(task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '');
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setIsEditingTask(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    createTaskMutation.mutate(
      {
        listId: list.id,
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        priorityId: taskPriorityId && taskPriorityId !== 'none' ? taskPriorityId : undefined,
        startDate: taskStartDate ? new Date(taskStartDate).toISOString() : undefined,
        dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : undefined,
      },
      {
        onSuccess: () => {
          setTaskTitle('');
          setTaskDesc('');
          setTaskPriorityId('');
          setTaskStartDate('');
          setTaskDueDate('');
          setIsOpen(false);
        },
      },
    );
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim() && editedTitle.trim() !== list.name) {
      onUpdateList(editedTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleUpdateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask) return;
    updateTaskMutation.mutate(
      {
        id: activeTask.id,
        data: {
          title: editTitle.trim(),
          description: editDesc.trim(),
          priorityId: editPriorityId === 'none' ? null : editPriorityId || null,
          startDate: editStartDate ? new Date(editStartDate).toISOString() : null,
          dueDate: editDueDate ? new Date(editDueDate).toISOString() : null,
        },
      },
      {
        onSuccess: () => {
          setActiveTask(null);
          setIsEditingTask(false);
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
      className="w-72 shrink-0 flex flex-col max-h-[calc(100vh-12rem)] bg-zinc-900/30 border border-zinc-900 rounded-2xl p-4 space-y-4"
    >
      {/* Column Header */}
      <div className="flex items-center justify-between">
        {isEditingTitle ? (
          <Input
            autoFocus
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
            className="h-7 border-zinc-800 bg-zinc-950 px-2 py-0 text-sm focus-visible:ring-1 focus-visible:ring-orange-500 font-bold"
          />
        ) : (
          <div className="flex items-center gap-x-2 group">
            <h3
              onClick={() => setIsEditingTitle(true)}
              className="text-sm font-bold text-white tracking-tight cursor-pointer hover:text-orange-500 transition-colors"
            >
              {list.name}
            </h3>
            <span className="text-2xs text-zinc-500 font-semibold bg-zinc-900 px-1.5 py-0.5 rounded">
              {tasks?.length ?? 0}
            </span>
          </div>
        )}
        <button
          onClick={() => {
            if (confirm('Delete this column and all its tasks permanently?')) {
              onDeleteList();
            }
          }}
          className="text-zinc-500 hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-[50px] pr-1">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
          </div>
        ) : tasks && tasks.length > 0 ? (
          tasks.map((task) => {
            const taskPriority = priorities.find((p) => p.id === task.priorityId);
            return (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', task.id);
                }}
                onClick={() => handleOpenDetails(task)}
                className="group bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-900/80 hover:border-zinc-800 rounded-xl p-4 space-y-2 cursor-grab active:cursor-grabbing transition-all shadow-sm"
              >
                <div className="flex items-start justify-between gap-x-2">
                  <span className="text-sm font-medium text-zinc-100 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                    {task.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this task?')) {
                        deleteTaskMutation.mutate(task.id);
                      }
                    }}
                    className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
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
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-xs text-zinc-600">No tasks</div>
        )}
      </div>

      {/* Add Task Trigger Button */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghost"
        size="sm"
        className="w-full text-zinc-400 hover:text-white justify-start gap-x-1.5 px-2 hover:bg-zinc-900/50 rounded-xl"
      >
        <Plus className="h-4 w-4 text-orange-500" />
        <span className="text-xs font-semibold">New Task</span>
      </Button>

      {/* Create Task Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md bg-zinc-950 border-zinc-900 text-zinc-50 rounded-2xl">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-xl font-bold text-white tracking-tight">
              New Task
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Create a task inside &quot;{list.name}&quot; column.
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
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-900 text-zinc-50">
                  <SelectItem value="none">None</SelectItem>
                  {priorities.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="flex items-center gap-x-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: p.color }}
                        />
                        {p.name}
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
                  className="w-full border-zinc-800 bg-zinc-900/50 text-zinc-100 text-xs"
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
                  className="w-full border-zinc-800 bg-zinc-900/50 text-zinc-100 text-xs"
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

      {/* Task Details / Edit Dialog */}
      <Dialog open={!!activeTask} onOpenChange={(open) => !open && setActiveTask(null)}>
        {activeTask && (
          <DialogContent className="max-w-md bg-zinc-950 border-zinc-900 text-zinc-50 rounded-2xl">
            <DialogHeader className="text-left space-y-1">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-bold text-white tracking-tight flex items-center gap-x-2">
                  <CheckCircle className="h-5 w-5 text-orange-500" />
                  Task Details
                </DialogTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditingTask(!isEditingTask)}
                  className="text-zinc-400 hover:text-white mr-6"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  {isEditingTask ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </DialogHeader>

            {isEditingTask ? (
              <form onSubmit={handleUpdateTaskSubmit} className="space-y-4 pt-2">
                <div className="flex flex-col gap-y-1.5">
                  <Label
                    htmlFor="edit-title"
                    className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                  >
                    Title
                  </Label>
                  <Input
                    id="edit-title"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full border-zinc-800 bg-zinc-900/50 text-zinc-100 focus-visible:ring-1 focus-visible:ring-orange-500"
                  />
                </div>

                <div className="flex flex-col gap-y-1.5">
                  <Label
                    htmlFor="edit-desc"
                    className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="edit-desc"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full border-zinc-800 bg-zinc-900/50 text-zinc-100 min-h-[80px] focus-visible:ring-1 focus-visible:ring-orange-500"
                  />
                </div>

                <div className="flex flex-col gap-y-1.5">
                  <Label
                    htmlFor="edit-priority"
                    className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                  >
                    Priority
                  </Label>
                  <Select
                    value={editPriorityId}
                    onValueChange={(val) => setEditPriorityId(val || '')}
                  >
                    <SelectTrigger
                      id="edit-priority"
                      className="w-full border-zinc-800 bg-zinc-900/50 text-zinc-100"
                    >
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-zinc-900 text-zinc-50">
                      <SelectItem value="none">None</SelectItem>
                      {priorities.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <span className="flex items-center gap-x-2">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: p.color }}
                            />
                            {p.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-y-1.5">
                    <Label
                      htmlFor="edit-start-date"
                      className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                    >
                      Start Date
                    </Label>
                    <Input
                      id="edit-start-date"
                      type="date"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      className="w-full border-zinc-800 bg-zinc-900/50 text-zinc-100 text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-y-1.5">
                    <Label
                      htmlFor="edit-due-date"
                      className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                    >
                      Due Date
                    </Label>
                    <Input
                      id="edit-due-date"
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="w-full border-zinc-800 bg-zinc-900/50 text-zinc-100 text-xs"
                    />
                  </div>
                </div>

                <div className="flex gap-x-2 pt-2">
                  <Button
                    type="submit"
                    disabled={updateTaskMutation.isPending}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-xl"
                  >
                    {updateTaskMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsEditingTask(false)}
                    className="border border-zinc-850 hover:bg-zinc-900"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Title
                  </span>
                  <p className="text-sm font-bold text-white">{activeTask.title}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Priority
                  </span>
                  <div>
                    {(() => {
                      const activePriority = priorities.find((p) => p.id === activeTask.priorityId);
                      return activePriority ? (
                        <span
                          className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded border"
                          style={{
                            backgroundColor: `${activePriority.color}15`,
                            color: activePriority.color,
                            borderColor: `${activePriority.color}30`,
                          }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full mr-1.5"
                            style={{ backgroundColor: activePriority.color }}
                          />
                          {activePriority.name}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-500">None</span>
                      );
                    })()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-x-1">
                      <Calendar className="h-3 w-3 text-zinc-500" />
                      Start Date
                    </span>
                    <p className="text-xs text-zinc-300">
                      {activeTask.startDate
                        ? new Date(activeTask.startDate).toLocaleDateString()
                        : '-'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-x-1">
                      <Calendar className="h-3 w-3 text-zinc-500" />
                      Due Date
                    </span>
                    <p className="text-xs text-zinc-300">
                      {activeTask.dueDate ? new Date(activeTask.dueDate).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Description
                  </span>
                  <p className="text-xs text-zinc-300 bg-zinc-900/30 border border-zinc-900 rounded-xl p-3 leading-relaxed whitespace-pre-wrap">
                    {activeTask.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => setActiveTask(null)}
                    className="w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 font-medium py-2 rounded-xl"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
