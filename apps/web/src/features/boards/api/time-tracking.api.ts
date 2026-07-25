import { api } from '@/lib/api-client';

export interface TimeEntryItem {
  id: string;
  taskId: string;
  userId: string;
  duration: number;
  description?: string;
  date: string;
  createdAt: string;
  startTime?: string;
  endTime?: string;
}

export interface CreateTimeEntryInput {
  taskId: string;
  startTime: string;
  endTime?: string;
  description?: string;
}

export interface UpdateTimeEntryInput {
  startTime?: string;
  endTime?: string;
  description?: string;
}

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res && (res as { data: unknown }).data !== undefined) {
    return (res as { data: T }).data;
  }
  return res as T;
}

export const getTimeEntriesByTask = async (taskId: string): Promise<TimeEntryItem[]> => {
  const response = await api.get<unknown>(`/time-entries/tasks/${taskId}`);
  return unwrap<TimeEntryItem[]>(response);
};

export const createTimeEntry = async (data: CreateTimeEntryInput): Promise<TimeEntryItem> => {
  const response = await api.post<unknown>('/time-entries', data);
  return unwrap<TimeEntryItem>(response);
};

export const stopTimer = async (id: string): Promise<TimeEntryItem> => {
  const response = await api.put<unknown>(`/time-entries/${id}/stop`);
  return unwrap<TimeEntryItem>(response);
};

export const updateTimeEntry = async (id: string, data: UpdateTimeEntryInput): Promise<TimeEntryItem> => {
  const response = await api.put<unknown>(`/time-entries/${id}`, data);
  return unwrap<TimeEntryItem>(response);
};

export const deleteTimeEntry = async (id: string): Promise<void> => {
  await api.delete<void>(`/time-entries/${id}`);
};
