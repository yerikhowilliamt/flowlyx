import { api } from '@/lib/api-client';

export interface SubtaskItem {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskCommentItem {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskAssignmentItem {
  id: string;
  taskId: string;
  userId: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
  };
  createdAt?: string;
}

export interface LabelItem {
  id: string;
  projectId: string;
  name: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskAttachmentItem {
  id: string;
  taskId: string;
  uploaderId: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  fileType?: string;
  createdAt?: string;
}

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res && (res as { data: unknown }).data !== undefined) {
    return (res as { data: T }).data;
  }
  return res as T;
}

// ==================== SUBTASKS API ====================
export const getSubtasks = async (taskId: string): Promise<SubtaskItem[]> => {
  const response = await api.get<unknown>(`/subtasks?taskId=${taskId}`);
  return unwrap<SubtaskItem[]>(response);
};

export const createSubtask = async (data: { taskId: string; title: string }): Promise<SubtaskItem> => {
  const response = await api.post<unknown>('/subtasks', data);
  return unwrap<SubtaskItem>(response);
};

export const updateSubtask = async (
  id: string,
  data: { title?: string; isCompleted?: boolean },
): Promise<SubtaskItem> => {
  const response = await api.patch<unknown>(`/subtasks/${id}`, data);
  return unwrap<SubtaskItem>(response);
};

export const deleteSubtask = async (id: string): Promise<void> => {
  await api.delete<void>(`/subtasks/${id}`);
};

// ==================== TASK COMMENTS API ====================
export const getTaskComments = async (taskId: string): Promise<TaskCommentItem[]> => {
  const response = await api.get<unknown>(`/task-comments?taskId=${taskId}`);
  return unwrap<TaskCommentItem[]>(response);
};

export const createTaskComment = async (data: { taskId: string; content: string }): Promise<TaskCommentItem> => {
  const response = await api.post<unknown>('/task-comments', data);
  return unwrap<TaskCommentItem>(response);
};

export const updateTaskComment = async (
  id: string,
  data: { content: string },
): Promise<TaskCommentItem> => {
  const response = await api.patch<unknown>(`/task-comments/${id}`, data);
  return unwrap<TaskCommentItem>(response);
};

export const deleteTaskComment = async (id: string): Promise<void> => {
  await api.delete<void>(`/task-comments/${id}`);
};

// ==================== TASK ASSIGNMENTS API ====================
export const getTaskAssignments = async (taskId: string): Promise<TaskAssignmentItem[]> => {
  const response = await api.get<unknown>(`/task-assignments?taskId=${taskId}`);
  return unwrap<TaskAssignmentItem[]>(response);
};

export const createTaskAssignment = async (data: {
  taskId: string;
  userId: string;
}): Promise<TaskAssignmentItem> => {
  const response = await api.post<unknown>('/task-assignments', data);
  return unwrap<TaskAssignmentItem>(response);
};

export const deleteTaskAssignment = async (id: string): Promise<void> => {
  await api.delete<void>(`/task-assignments/${id}`);
};

// ==================== LABELS API ====================
export const getTaskLabels = async (taskId: string): Promise<LabelItem[]> => {
  const response = await api.get<unknown>(`/labels?taskId=${taskId}`);
  return unwrap<LabelItem[]>(response);
};

export const getProjectLabels = async (projectId: string): Promise<LabelItem[]> => {
  const response = await api.get<unknown>(`/labels?projectId=${projectId}`);
  return unwrap<LabelItem[]>(response);
};

export const createLabel = async (data: {
  projectId: string;
  name: string;
  color: string;
}): Promise<LabelItem> => {
  const response = await api.post<unknown>('/labels', data);
  return unwrap<LabelItem>(response);
};

export const addLabelToTask = async (labelId: string, taskId: string): Promise<LabelItem> => {
  const response = await api.post<unknown>(`/labels/${labelId}/tasks/${taskId}`);
  return unwrap<LabelItem>(response);
};

export const removeLabelFromTask = async (labelId: string, taskId: string): Promise<void> => {
  await api.delete<void>(`/labels/${labelId}/tasks/${taskId}`);
};

export const deleteLabel = async (id: string): Promise<void> => {
  await api.delete<void>(`/labels/${id}`);
};

// ==================== TASK ATTACHMENTS API ====================
export const getTaskAttachments = async (taskId: string): Promise<TaskAttachmentItem[]> => {
  const response = await api.get<unknown>(`/tasks/${taskId}/attachments`);
  return unwrap<TaskAttachmentItem[]>(response);
};

export const uploadTaskAttachments = async (
  taskId: string,
  files: File[],
): Promise<TaskAttachmentItem[]> => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  const response = await api.post<unknown>(`/tasks/${taskId}/attachments`, formData);
  return unwrap<TaskAttachmentItem[]>(response);
};

export const deleteTaskAttachment = async (taskId: string, attachmentId: string): Promise<void> => {
  await api.delete<void>(`/tasks/${taskId}/attachments/${attachmentId}`);
};
