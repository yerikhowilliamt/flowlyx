import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSubtasks,
  createSubtask,
  updateSubtask,
  deleteSubtask,
  getTaskComments,
  createTaskComment,
  updateTaskComment,
  deleteTaskComment,
  getTaskAssignments,
  createTaskAssignment,
  deleteTaskAssignment,
  getTaskLabels,
  getProjectLabels,
  createLabel,
  addLabelToTask,
  removeLabelFromTask,
  deleteLabel,
  getTaskAttachments,
  uploadTaskAttachments,
  deleteTaskAttachment,
} from '../api/task-details.api';
import { toast } from 'sonner';

// ==================== SUBTASKS HOOKS ====================
export function useSubtasks(taskId?: string) {
  return useQuery({
    queryKey: ['subtasks', taskId],
    queryFn: () => getSubtasks(taskId!),
    enabled: !!taskId,
  });
}

export function useCreateSubtask(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => createSubtask({ taskId, title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', taskId] });
      toast.success('Subtask added');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add subtask');
    },
  });
}

export function useUpdateSubtask(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title?: string; isCompleted?: boolean } }) =>
      updateSubtask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', taskId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update subtask');
    },
  });
}

export function useDeleteSubtask(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSubtask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', taskId] });
      toast.success('Subtask deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete subtask');
    },
  });
}

// ==================== TASK COMMENTS HOOKS ====================
export function useTaskComments(taskId?: string) {
  return useQuery({
    queryKey: ['task-comments', taskId],
    queryFn: () => getTaskComments(taskId!),
    enabled: !!taskId,
  });
}

export function useCreateTaskComment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => createTaskComment({ taskId, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
      toast.success('Comment posted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to post comment');
    },
  });
}

export function useUpdateTaskComment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      updateTaskComment(id, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
      toast.success('Comment updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update comment');
    },
  });
}

export function useDeleteTaskComment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTaskComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments', taskId] });
      toast.success('Comment deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete comment');
    },
  });
}

// ==================== TASK ASSIGNMENTS HOOKS ====================
export function useTaskAssignments(taskId?: string) {
  return useQuery({
    queryKey: ['task-assignments', taskId],
    queryFn: () => getTaskAssignments(taskId!),
    enabled: !!taskId,
  });
}

export function useCreateTaskAssignment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => createTaskAssignment({ taskId, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-assignments', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('User assigned to task');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to assign user');
    },
  });
}

export function useDeleteTaskAssignment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTaskAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-assignments', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Assignment removed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove assignment');
    },
  });
}

// ==================== LABELS HOOKS ====================
export function useTaskLabels(taskId?: string) {
  return useQuery({
    queryKey: ['task-labels', taskId],
    queryFn: () => getTaskLabels(taskId!),
    enabled: !!taskId,
  });
}

export function useProjectLabels(projectId?: string) {
  return useQuery({
    queryKey: ['project-labels', projectId],
    queryFn: () => getProjectLabels(projectId!),
    enabled: !!projectId,
  });
}

export function useCreateLabel(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; color: string }) => createLabel({ projectId, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-labels', projectId] });
      toast.success('Label created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create label');
    },
  });
}

export function useAddLabelToTask(taskId: string, projectId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (labelId: string) => addLabelToTask(labelId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-labels', taskId] });
      if (projectId) queryClient.invalidateQueries({ queryKey: ['project-labels', projectId] });
      toast.success('Label added');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add label');
    },
  });
}

export function useRemoveLabelFromTask(taskId: string, projectId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (labelId: string) => removeLabelFromTask(labelId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-labels', taskId] });
      if (projectId) queryClient.invalidateQueries({ queryKey: ['project-labels', projectId] });
      toast.success('Label removed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove label');
    },
  });
}

export function useDeleteLabel(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLabel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-labels', projectId] });
      toast.success('Label deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete label');
    },
  });
}

// ==================== TASK ATTACHMENTS HOOKS ====================
export function useTaskAttachments(taskId?: string) {
  return useQuery({
    queryKey: ['task-attachments', taskId],
    queryFn: () => getTaskAttachments(taskId!),
    enabled: !!taskId,
  });
}

export function useUploadTaskAttachments(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => uploadTaskAttachments(taskId, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-attachments', taskId] });
      toast.success('Attachment(s) uploaded');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload attachment');
    },
  });
}

export function useDeleteTaskAttachment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId: string) => deleteTaskAttachment(taskId, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-attachments', taskId] });
      toast.success('Attachment deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete attachment');
    },
  });
}
