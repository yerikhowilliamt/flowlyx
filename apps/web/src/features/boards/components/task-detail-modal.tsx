'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { TaskResponse, PrioritySummary } from '../types/board.types';
import { AdminUser } from '@/features/admin/types/admin.types';
import { AiMagicButton } from '@/features/ai/components/ai-magic-button';
import { LabelItem, TaskAttachmentItem } from '../api/task-details.api';
import {
  useSubtasks,
  useCreateSubtask,
  useUpdateSubtask,
  useDeleteSubtask,
  useTaskComments,
  useCreateTaskComment,
  useDeleteTaskComment,
  useTaskAssignments,
  useCreateTaskAssignment,
  useDeleteTaskAssignment,
  useTaskLabels,
  useProjectLabels,
  useCreateLabel,
  useAddLabelToTask,
  useRemoveLabelFromTask,
  useTaskAttachments,
  useUploadTaskAttachments,
  useDeleteTaskAttachment,
} from '../hooks/use-task-details';
import {
  useTimeEntries,
  useCreateTimeEntry,
  useStopTimer,
  useDeleteTimeEntry,
} from '../hooks/use-time-tracking';
import { useActivities } from '../hooks/use-activities';
import { useUpdateTask } from '../hooks/use-boards';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Paperclip,
  MessageSquare,
  UserPlus,
  Tag,
  Loader2,
  X,
  Send,
  Download,
  Calendar,
  Eye,
  Play,
  Square as SquareIcon,
  Clock,
  Activity,
} from 'lucide-react';
import {
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
} from '@/components/ui/attachment';

function parseMarkdown(md: string): string {
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/^###### (.*$)/gim, '<h6 class="text-xs font-bold text-zinc-100 mt-2 mb-1">$1</h6>');
  html = html.replace(/^##### (.*$)/gim, '<h5 class="text-sm font-bold text-zinc-100 mt-2 mb-1">$1</h5>');
  html = html.replace(/^#### (.*$)/gim, '<h4 class="text-sm font-bold text-zinc-100 mt-3 mb-1">$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-zinc-100 mt-3 mb-1.5">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-zinc-100 mt-4 mb-2 border-b border-zinc-900 pb-1">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold text-zinc-100 mt-4 mb-2">$1</h1>');

  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong class="font-bold text-white">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  html = html.replace(/_(.*?)_/g, '<em class="italic">$1</em>');

  html = html.replace(/`(.*?)`/g, '<code class="bg-zinc-900 px-1 py-0.5 rounded font-mono text-3xs text-orange-400">$1</code>');
  html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-2 border-orange-500 pl-3 italic text-zinc-400 my-2">$1</blockquote>');

  html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="list-disc list-inside ml-2 text-zinc-300">$1</li>');
  html = html.replace(/^\s*\*\s+(.*$)/gim, '<li class="list-disc list-inside ml-2 text-zinc-300">$1</li>');

  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-orange-500 hover:underline">$1</a>');
  html = html.replace(/\n/g, '<br />');

  return html;
}

interface TaskDetailModalProps {
  task: TaskResponse | null;
  projectId: string;
  priorities: PrioritySummary[];
  allUsers?: AdminUser[];
  currentUser?: { id: string; role?: string } | null;
  onClose: () => void;
  onUpdateTask?: (updatedData: Partial<TaskResponse>) => void;
}

export function TaskDetailModal({
  task,
  projectId,
  priorities,
  allUsers = [],
  currentUser,
  onClose,
  onUpdateTask,
}: TaskDetailModalProps) {
  const taskId = task?.id || '';

  const updateTaskMutation = useUpdateTask();

  // Subtasks
  const { data: subtasks = [], isLoading: isSubtasksLoading } = useSubtasks(task ? taskId : undefined);
  const createSubtaskMutation = useCreateSubtask(taskId);
  const updateSubtaskMutation = useUpdateSubtask(taskId);
  const deleteSubtaskMutation = useDeleteSubtask(taskId);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Comments
  const { data: comments = [], isLoading: isCommentsLoading } = useTaskComments(task ? taskId : undefined);
  const createCommentMutation = useCreateTaskComment(taskId);
  const deleteCommentMutation = useDeleteTaskComment(taskId);
  const [commentContent, setCommentContent] = useState('');

  // Assignments
  const { data: assignments = [], isLoading: isAssignmentsLoading } = useTaskAssignments(
    task ? taskId : undefined,
  );
  const createAssignmentMutation = useCreateTaskAssignment(taskId);
  const deleteAssignmentMutation = useDeleteTaskAssignment(taskId);
  const [selectedUserIdToAssign, setSelectedUserIdToAssign] = useState('');

  // Labels
  const { data: taskLabels = [], isLoading: isTaskLabelsLoading } = useTaskLabels(
    task ? taskId : undefined,
  );
  const { data: projectLabels = [] } = useProjectLabels(task ? projectId : undefined);
  const createLabelMutation = useCreateLabel(projectId);
  const addLabelMutation = useAddLabelToTask(taskId, projectId);
  const removeLabelMutation = useRemoveLabelFromTask(taskId, projectId);

  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#3b82f6');
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);

  // Attachments
  const { data: attachments = [], isLoading: isAttachmentsLoading } = useTaskAttachments(
    task ? taskId : undefined,
  );
  const uploadAttachmentsMutation = useUploadTaskAttachments(taskId);
  const deleteAttachmentMutation = useDeleteTaskAttachment(taskId);

  const [selectedFiles, setSelectedFiles] = useState<{ file: File; previewUrl: string }[]>([]);
  const [previewAttachment, setPreviewAttachment] = useState<TaskAttachmentItem | null>(null);

  const [previewTextContent, setPreviewTextContent] = useState<string | null>(null);
  const [isTextContentLoading, setIsTextContentLoading] = useState(false);

  // Time Tracking
  const { data: timeEntries = [], isLoading: isTimeEntriesLoading } = useTimeEntries(task ? taskId : undefined);
  const createTimeEntryMutation = useCreateTimeEntry(taskId);
  const stopTimerMutation = useStopTimer(taskId);
  const deleteTimeEntryMutation = useDeleteTimeEntry(taskId);
  const [timeDescription, setTimeDescription] = useState('');

  // Activities
  const { data: activitiesData } = useActivities(task ? taskId : undefined, { limit: 10 });
  const activities = activitiesData?.data || [];

  // Find active timer (entry with duration = 0 or no endTime)
  const activeTimer = timeEntries.find((entry) => !entry.endTime || entry.duration === 0);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let active = true;
    if (!previewAttachment) {
      Promise.resolve().then(() => {
        setPreviewTextContent(null);
      });
      return;
    }
    const url = previewAttachment.fileUrl || '';
    const mime = previewAttachment.fileType || '';
    const isText = url.match(/\.(txt|md)/i) || mime.startsWith('text/');
    if (isText) {
      Promise.resolve().then(() => {
        if (active) setIsTextContentLoading(true);
      });
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.text();
        })
        .then((text) => {
          if (active) {
            setPreviewTextContent(text);
            setIsTextContentLoading(false);
          }
        })
        .catch((err) => {
          console.error(err);
          if (active) {
            setPreviewTextContent('Failed to load text preview.');
            setIsTextContentLoading(false);
          }
        });
    }
    return () => {
      active = false;
    };
  }, [previewAttachment]);

  if (!task) return null;

  // Subtask progress
  const completedSubtasksCount = subtasks.filter((s) => s.isCompleted).length;
  const subtasksProgress =
    subtasks.length > 0 ? Math.round((completedSubtasksCount / subtasks.length) * 100) : 0;

  // Users available to assign
  const assignedUserIds = new Set(assignments.map((a) => a.userId));
  const unassignedUsers = allUsers.filter((u) => !assignedUserIds.has(u.id));

  // Labels available to add
  const taskLabelIds = new Set(taskLabels.map((l) => l.id));
  const unassignedLabels = projectLabels.filter((l) => !taskLabelIds.has(l.id));

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    createSubtaskMutation.mutate(newSubtaskTitle.trim(), {
      onSuccess: () => setNewSubtaskTitle(''),
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    createCommentMutation.mutate(commentContent.trim(), {
      onSuccess: () => setCommentContent(''),
    });
  };

  const handleAssignUser = (userId: string | null) => {
    if (!userId) return;
    createAssignmentMutation.mutate(userId, {
      onSuccess: () => setSelectedUserIdToAssign(''),
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files).map((file) => ({
      file,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
    }));
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleCreateNewLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;
    createLabelMutation.mutate(
      { name: newLabelName.trim(), color: newLabelColor },
      {
        onSuccess: (res) => {
          const label = res as unknown as LabelItem;
          setNewLabelName('');
          setIsCreatingLabel(false);
          if (label && label.id) {
            addLabelMutation.mutate(label.id);
          }
        },
      },
    );
  };

  return (
    <>
      <Dialog open={!!task} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-7xl w-[94vw] max-w-7xl max-h-[90vh] overflow-y-auto scrollbar-none bg-zinc-950 border-zinc-900 text-zinc-50 rounded-2xl p-6 sm:p-8">
        <DialogHeader className="text-left space-y-2 border-b border-zinc-900 pb-4">
          <div className="flex items-center justify-between gap-x-4">
            <div className="flex items-center gap-x-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                task.status === 'ARCHIVED' 
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-500' 
                  : 'bg-zinc-900 border-zinc-800 text-orange-500'
              }`}>
                Task Detail
              </span>
              
              <button
                type="button"
                onClick={() => {
                  const nextStatus = task.status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED';
                  if (onUpdateTask) {
                    onUpdateTask({ status: nextStatus });
                  }
                  updateTaskMutation.mutate({ id: task.id, data: { status: nextStatus } as unknown as Parameters<typeof updateTaskMutation.mutate>[0]['data'] });
                }}
                className={`text-xs font-semibold px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                  task.status === 'ARCHIVED'
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    : 'bg-zinc-900 border-orange-500/50 text-orange-500 hover:bg-orange-500/10'
                }`}
              >
                {task.status === 'ARCHIVED' ? 'Archived' : 'Active'}
              </button>

              {(() => {
                const targetPId = task.priorityId || (task as unknown as { priority_id?: string })?.priority_id;
                const p = priorities.find((item) => item.id === targetPId);
                if (!p) return null;
                return (
                  <span
                    className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded border"
                    style={{
                      backgroundColor: `${p.color}15`,
                      color: p.color,
                      borderColor: `${p.color}30`,
                    }}
                  >
                    {p.name}
                  </span>
                );
              })()}
              {task.dueDate && (
                <span className="flex items-center gap-x-1 text-xs text-zinc-400">
                  <Calendar className="h-3 w-3" />
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <DialogTitle className="text-xl font-bold text-white tracking-tight leading-snug">
            {task.title}
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-400">
            <div className="flex flex-col gap-2">
              <div>{task.description || 'No description provided for this task.'}</div>
              {task.description && task.description.trim() !== '' && (
                <div className="mt-1">
                  <AiMagicButton 
                    type="summarize" 
                    inputValue={task.description}
                    onResult={(res) => {
                      // Fallback as a quick view via alert for now, or update description in UI
                      alert('AI Summary:\n\n' + res);
                    }} 
                  />
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Main Column (2/3 width) */}
          <div className="md:col-span-2 space-y-6">

            {/* Time Tracking Section */}
            <div className="space-y-3 bg-zinc-900/20 border border-zinc-900 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Time Tracking
                  </h4>
                </div>
              </div>

              {/* Timer controls */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-900/80">
                {activeTimer ? (
                  <div className="flex items-center gap-x-4">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-450 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                    <div className="text-xs">
                      <span className="text-zinc-400">Timer Running...</span>
                      {activeTimer.description && <p className="text-3xs text-zinc-500 truncate max-w-xs">{activeTimer.description}</p>}
                    </div>
                    <Button
                      type="button"
                      onClick={() => stopTimerMutation.mutate(activeTimer.id)}
                      disabled={stopTimerMutation.isPending}
                      className="bg-red-650 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1 rounded-lg flex items-center gap-1"
                    >
                      <SquareIcon className="h-3 w-3 fill-current" /> Stop
                    </Button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      createTimeEntryMutation.mutate({
                        startTime: new Date().toISOString(),
                        description: timeDescription.trim() || undefined,
                      }, {
                        onSuccess: () => setTimeDescription(''),
                      });
                    }}
                    className="flex gap-x-2 w-full"
                  >
                    <Input
                      placeholder="What are you working on?"
                      value={timeDescription}
                      onChange={(e) => setTimeDescription(e.target.value)}
                      className="border-zinc-800 bg-zinc-900/60 text-xs text-zinc-100 placeholder:text-zinc-500"
                    />
                    <Button
                      type="submit"
                      disabled={createTimeEntryMutation.isPending}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 rounded-xl flex items-center gap-1"
                    >
                      <Play className="h-3 w-3 fill-current" /> Start
                    </Button>
                  </form>
                )}
              </div>

              {/* Time logs list */}
              <div className="space-y-2 pt-1 max-h-48 overflow-y-auto scrollbar-none">
                {isTimeEntriesLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-orange-500 my-2" />
                ) : timeEntries.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">No time logged yet.</p>
                ) : (
                  timeEntries.map((entry, index) => (
                    <div
                      key={entry.id || `time-entry-${index}`}
                      className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/40 border border-zinc-900/80 hover:border-zinc-800 transition-colors group"
                    >
                      <div className="flex flex-col text-xs text-zinc-200">
                        <span className="font-medium text-white">
                          {formatDuration(entry.duration)}
                        </span>
                        {entry.description && <span className="text-3xs text-zinc-500">{entry.description}</span>}
                      </div>
                      <div className="flex items-center gap-x-2">
                        <span className="text-3xs text-zinc-500">
                          {entry.startTime ? new Date(entry.startTime).toLocaleDateString() : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteTimeEntryMutation.mutate(entry.id)}
                          disabled={deleteTimeEntryMutation.isPending}
                          className="text-zinc-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Subtasks Section */}
            <div className="space-y-3 bg-zinc-900/20 border border-zinc-900 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                  <CheckSquare className="h-4 w-4 text-orange-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Subtasks ({completedSubtasksCount}/{subtasks.length})
                  </h4>
                  <AiMagicButton 
                    type="suggest-task"
                    inputValue={
                      subtasks.length > 0 
                        ? `${task.description || task.title}\n\nExisting subtasks to avoid duplicating:\n${subtasks.map(s => `- ${s.title}`).join('\n')}` 
                        : (task.description || task.title)
                    }
                    onResult={(res) => {
                      const firstSubtaskTitle = res
                        .split('\n')
                        .filter(Boolean)[1]
                        ?.replace(/^- /, '')
                        .trim();
                      if (firstSubtaskTitle) setNewSubtaskTitle(firstSubtaskTitle);
                    }}
                  />
                </div>
                {subtasks.length > 0 && (
                  <span className="text-2xs font-semibold text-orange-400">
                    {subtasksProgress}%
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {subtasks.length > 0 && (
                <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-orange-500 h-full transition-all duration-300"
                    style={{ width: `${subtasksProgress}%` }}
                  />
                </div>
              )}

              {/* Subtasks list */}
              <div className="space-y-2 pt-1">
                {isSubtasksLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-orange-500 my-2" />
                ) : subtasks.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/40 border border-zinc-900/80 hover:border-zinc-800 transition-colors group"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        updateSubtaskMutation.mutate({
                          id: s.id,
                          data: { isCompleted: !s.isCompleted },
                        })
                      }
                      className="flex items-center gap-x-2.5 text-xs text-zinc-200 text-left flex-1"
                    >
                      {s.isCompleted ? (
                        <CheckSquare className="h-4 w-4 text-orange-500 shrink-0" />
                      ) : (
                        <Square className="h-4 w-4 text-zinc-500 shrink-0" />
                      )}
                      <span className={s.isCompleted ? 'line-through text-zinc-500' : 'font-medium'}>
                        {s.title}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSubtaskMutation.mutate(s.id)}
                      className="text-zinc-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add subtask form */}
              <form onSubmit={handleAddSubtask} className="flex gap-x-2 pt-1">
                <Input
                  placeholder="Add a new subtask..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="border-zinc-800 bg-zinc-900/60 text-xs text-zinc-100 placeholder:text-zinc-500"
                />
                <Button
                  type="submit"
                  disabled={createSubtaskMutation.isPending || !newSubtaskTitle.trim()}
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 rounded-xl"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </form>
            </div>

            {/* Attachments Section */}
            <div className="space-y-3 bg-zinc-900/20 border border-zinc-900 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                  <Paperclip className="h-4 w-4 text-orange-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Attachments ({attachments.length})
                  </h4>
                </div>
                <label className="cursor-pointer inline-flex items-center gap-x-1 text-2xs font-semibold text-orange-400 hover:text-orange-300">
                  <Plus className="h-3 w-3" /> Upload File
                  <input type="file" multiple onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              {/* Attachment list */}
              {isAttachmentsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-orange-500 my-2" />
              ) : attachments.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">No attachments uploaded.</p>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  {attachments.map((att, index) => (
                    <Attachment key={att.id || `att-${index}`} size="sm" className="bg-zinc-900 border-zinc-800">
                      <AttachmentMedia>
                        <Paperclip className="h-4 w-4 text-orange-400" />
                      </AttachmentMedia>
                      <AttachmentContent>
                        <AttachmentTitle className="text-zinc-200 text-xs">{att.fileName}</AttachmentTitle>
                        <AttachmentDescription className="text-zinc-500 text-3xs">
                          {att.fileSize ? `${(att.fileSize / 1024).toFixed(1)} KB` : 'File'}
                        </AttachmentDescription>
                      </AttachmentContent>
                      <AttachmentActions>
                        <AttachmentAction
                          onClick={() => setPreviewAttachment(att)}
                          title="Preview"
                        >
                          <Eye className="h-3.5 w-3.5 text-zinc-400 hover:text-white" />
                        </AttachmentAction>
                        <AttachmentAction
                          onClick={() => window.open(att.fileUrl, '_blank')}
                          title="Download"
                        >
                          <Download className="h-3.5 w-3.5 text-zinc-400 hover:text-white" />
                        </AttachmentAction>
                        <AttachmentAction
                          onClick={() => deleteAttachmentMutation.mutate(att.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-zinc-500 hover:text-red-400" />
                        </AttachmentAction>
                      </AttachmentActions>
                    </Attachment>
                  ))}
                </div>
              )}

              {/* Pending Upload Previews */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2 border-t border-zinc-900 pt-3">
                  <p className="text-2xs font-bold text-zinc-400 uppercase tracking-wider">Pending Upload ({selectedFiles.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedFiles.map((f, i) => (
                      <div key={i} className="relative group rounded-xl border border-zinc-800 bg-zinc-900/40 p-2 flex items-center gap-x-2 w-48">
                        {f.previewUrl ? (
                          <Image src={f.previewUrl} width={32} height={32} className="rounded object-cover" alt="preview" unoptimized />
                        ) : (
                          <Paperclip className="h-8 w-8 text-zinc-500" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-zinc-200 truncate">{f.file.name}</p>
                          <p className="text-3xs text-zinc-500">{(f.file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i));
                            if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
                          }}
                          className="text-zinc-500 hover:text-red-400 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-x-2 justify-end pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        selectedFiles.forEach((f) => {
                          if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
                        });
                        setSelectedFiles([]);
                      }}
                      className="text-2xs text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        const filesToUpload = selectedFiles.map((f) => f.file);
                        uploadAttachmentsMutation.mutate(filesToUpload, {
                          onSuccess: () => {
                            selectedFiles.forEach((f) => {
                              if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
                            });
                            setSelectedFiles([]);
                          },
                        });
                      }}
                      disabled={uploadAttachmentsMutation.isPending}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-2xs font-semibold"
                    >
                      {uploadAttachmentsMutation.isPending ? 'Uploading...' : 'Confirm Upload'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Comments Stream */}
            <div className="space-y-3 bg-zinc-900/20 border border-zinc-900 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                  <MessageSquare className="h-4 w-4 text-orange-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Comments ({comments.length})
                  </h4>
                </div>
              </div>

              {/* Comment list */}
              <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-none pr-1">
                {isCommentsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-orange-500 my-2" />
                ) : comments.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">No comments yet. Start the discussion!</p>
                ) : (
                  comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-900 text-xs space-y-1 group"
                    >
                      <div className="flex items-center justify-between text-2xs text-zinc-400">
                        <div className="flex items-center gap-x-1.5 font-semibold text-zinc-300">
                          <div className="h-4 w-4 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-3xs font-bold">
                            {(c.user?.name || c.user?.email || 'U')[0]}
                          </div>
                          <span>{c.user?.name || c.user?.email || 'User'}</span>
                        </div>
                        <div className="flex items-center gap-x-2">
                          <span>{c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                          {(currentUser?.id === c.userId || currentUser?.role === 'SUPER_ADMIN') && (
                            <button
                              onClick={() => deleteCommentMutation.mutate(c.id)}
                              className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-zinc-200 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add comment form */}
              <form onSubmit={handleAddComment} className="space-y-2 pt-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="border-zinc-800 bg-zinc-900/60 text-xs text-zinc-100 placeholder:text-zinc-500 min-h-[60px]"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={createCommentMutation.isPending || !commentContent.trim()}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 rounded-xl"
                  >
                    <Send className="h-3 w-3 mr-1.5" />
                    Post Comment
                  </Button>
                </div>
              </form>
            </div>

            {/* Activities Stream */}
            <div className="space-y-3 bg-zinc-900/20 border border-zinc-900 rounded-xl p-4">
              <div className="flex items-center gap-x-2">
                <Activity className="h-4 w-4 text-orange-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Activity Log ({activities.length})
                </h4>
              </div>

              {/* Activity list */}
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-none pr-1">
                {activities.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">No activities logged yet.</p>
                ) : (
                  activities.map((a, index) => (
                    <div
                      key={a.id || `act-${index}`}
                      className="p-2 rounded-lg bg-zinc-900/40 border border-zinc-900/80 text-xs flex justify-between items-center"
                    >
                      <div className="text-zinc-200">
                        <span className="font-semibold text-white">{a.user?.name || a.user?.email || 'System'}</span>
                        {' '}{a.action.toLowerCase()}{' '}
                        {a.details?.title ? <span className="italic text-zinc-400">&quot;{String(a.details.title)}&quot;</span> : ''}
                      </div>
                      <span className="text-3xs text-zinc-500">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Column (1/3 width) */}
          <div className="space-y-6">

            {/* Assignees Section */}
            <div className="space-y-3 bg-zinc-900/20 border border-zinc-900 rounded-xl p-4">
              <div className="flex items-center gap-x-2">
                <UserPlus className="h-4 w-4 text-orange-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Assignees
                </h4>
              </div>

              {/* Active assignees */}
              <div className="space-y-1.5">
                {isAssignmentsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                ) : assignments.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">Unassigned</p>
                ) : (
                  assignments.map((a) => (
                    <div
                      key={a.userId || a.id}
                      className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800 text-xs"
                    >
                      <div className="flex items-center gap-x-2 truncate">
                        <div className="h-5 w-5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-3xs font-bold shrink-0">
                          {(a.user?.name || a.user?.email || 'U')[0]}
                        </div>
                        <span className="text-zinc-200 font-medium truncate">
                          {a.user?.name || a.user?.email}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteAssignmentMutation.mutate(a.id)}
                        className="text-zinc-500 hover:text-red-400 p-0.5"
                        title="Remove assignment"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Assign user select */}
              {unassignedUsers.length > 0 && (
                <Select value={selectedUserIdToAssign} onValueChange={handleAssignUser}>
                  <SelectTrigger className="w-full h-8 text-xs border-zinc-800 bg-zinc-900/60 text-zinc-300">
                    <SelectValue placeholder="+ Assign member" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-900 text-zinc-50 text-xs">
                    {unassignedUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name || u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Labels Section */}
            <div className="space-y-3 bg-zinc-900/20 border border-zinc-900 rounded-xl p-4">
              <div className="flex items-center gap-x-2">
                <Tag className="h-4 w-4 text-orange-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Labels
                </h4>
              </div>

              {/* Task active labels */}
              <div className="flex flex-wrap gap-1.5">
                {isTaskLabelsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                ) : taskLabels.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">No labels</p>
                ) : (
                  taskLabels.map((l) => (
                    <span
                      key={l.id}
                      className="inline-flex items-center gap-x-1 text-3xs font-semibold px-2 py-0.5 rounded border"
                      style={{
                        backgroundColor: `${l.color}20`,
                        color: l.color,
                        borderColor: `${l.color}40`,
                      }}
                    >
                      {l.name}
                      <button
                        type="button"
                        onClick={() => removeLabelMutation.mutate(l.id)}
                        className="hover:opacity-80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add existing label select */}
              {unassignedLabels.length > 0 && (
                <Select onValueChange={(val: string | null) => { if (val) addLabelMutation.mutate(val); }}>
                  <SelectTrigger className="w-full h-8 text-xs border-zinc-800 bg-zinc-900/60 text-zinc-300">
                    <SelectValue placeholder="+ Add label" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-900 text-zinc-50 text-xs">
                    {unassignedLabels.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        <span className="flex items-center gap-x-2">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
                          {l.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Create project label trigger */}
              {!isCreatingLabel ? (
                <button
                  type="button"
                  onClick={() => setIsCreatingLabel(true)}
                  className="text-3xs font-semibold text-orange-400 hover:underline block"
                >
                  + Create custom label
                </button>
              ) : (
                <form onSubmit={handleCreateNewLabel} className="space-y-2 pt-1">
                  <Input
                    placeholder="Label name..."
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    className="h-7 border-zinc-800 bg-zinc-900 text-xs text-zinc-100"
                  />
                  <div className="flex items-center gap-x-1.5">
                    {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewLabelColor(c)}
                        className={`h-4 w-4 rounded-full border ${newLabelColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-x-1">
                    <Button type="submit" size="sm" className="h-6 text-3xs bg-orange-500 hover:bg-orange-600 text-white">
                      Create
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsCreatingLabel(false)}
                      className="h-6 text-3xs text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* File Preview Dialog */}
    <Dialog open={!!previewAttachment} onOpenChange={(open) => !open && setPreviewAttachment(null)}>
      <DialogContent className="max-w-5xl w-[90vw] bg-zinc-950 border-zinc-900 text-zinc-50 rounded-2xl flex flex-col items-center justify-center p-6">
        <DialogHeader className="w-full text-left pb-2 border-b border-zinc-900 mb-4 flex flex-row items-center justify-between gap-x-4">
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-sm font-bold text-white truncate">
              {previewAttachment?.fileName}
            </DialogTitle>
            <DialogDescription className="text-2xs text-zinc-500">
              Uploaded file viewer
            </DialogDescription>
          </div>
          {previewAttachment && (
            <Button
              onClick={() => window.open(previewAttachment.fileUrl, '_blank')}
              variant="outline"
              size="sm"
              className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white rounded-xl text-2xs md:text-xs px-3"
            >
              View Fullscreen
            </Button>
          )}
        </DialogHeader>
        <div className="w-full flex items-center justify-center max-h-[75vh] overflow-auto scrollbar-none">
          {(() => {
            if (!previewAttachment) return null;
            const url = previewAttachment.fileUrl || '';
            const mime = previewAttachment.fileType || '';
            const isImage = mime.startsWith('image/') || url.match(/\.(jpeg|jpg|gif|png|webp)/i);
            const isPdf = mime === 'application/pdf' || url.match(/\.pdf/i);
            const isDoc = mime.match(/(msword|wordprocessingml|ms-excel|spreadsheetml|ms-powerpoint|presentationml)/) || url.match(/\.(docx?|xlsx?|pptx?)/i);
            const isText = mime.startsWith('text/') || url.match(/\.(txt|md)/i);

            if (isImage) {
              return (
                <Image
                  src={url}
                  alt={previewAttachment.fileName}
                  width={800}
                  height={500}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg border border-zinc-800"
                  unoptimized
                />
              );
            }

            if (isPdf) {
              return (
                <iframe
                  src={url}
                  className="w-full h-[65vh] rounded-lg border border-zinc-800 bg-white"
                  title={previewAttachment.fileName}
                />
              );
            }

            if (isDoc) {
              return (
                <iframe
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
                  className="w-full h-[65vh] rounded-lg border border-zinc-800 bg-white"
                  title={previewAttachment.fileName}
                />
              );
            }

            if (isText) {
              if (isTextContentLoading) {
                return (
                  <div className="flex h-48 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                  </div>
                );
              }
              const isMarkdown = url.toLowerCase().endsWith('.md') || mime === 'text/markdown';
              if (isMarkdown) {
                return (
                  <div
                    className="w-full max-h-[65vh] overflow-auto scrollbar-none p-5 rounded-lg border border-zinc-900 bg-zinc-950 text-xs text-zinc-300 text-left space-y-2 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(previewTextContent || '') }}
                  />
                );
              }
              return (
                <pre className="w-full max-h-[65vh] overflow-auto scrollbar-none p-4 rounded-lg border border-zinc-900 bg-zinc-950 font-mono text-xs text-zinc-300 whitespace-pre-wrap text-left">
                  {previewTextContent || 'No content.'}
                </pre>
              );
            }

            return (
              <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                <Paperclip className="h-16 w-16 text-zinc-600" />
                <p className="text-sm text-zinc-400">
                  Preview is not available for this file type.
                </p>
                <Button
                  onClick={() => window.open(url, '_blank')}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-xs px-4"
                >
                  Download File
                </Button>
              </div>
            );
          })()}
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
