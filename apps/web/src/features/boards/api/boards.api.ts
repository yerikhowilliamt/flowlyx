import { api } from '@/lib/api-client';
import {
  CreateBoardInput,
  CreateListInput,
  UpdateListInput,
  CreateTaskInput,
  UpdateTaskInput,
} from '../schemas/board.schema';
import {
  BoardResponse,
  BoardSummary,
  ListResponse,
  TaskResponse,
  PrioritySummary,
} from '../types/board.types';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res && (res as { data: unknown }).data !== undefined) {
    return (res as { data: T }).data;
  }
  return res as T;
}

// Boards API
export const getBoards = async (projectId: string): Promise<BoardSummary[]> => {
  const response = await api.get<unknown>(`/boards?projectId=${projectId}`);
  return unwrap<BoardSummary[]>(response);
};

export const createBoard = async (data: CreateBoardInput): Promise<BoardResponse> => {
  const response = await api.post<unknown>('/boards', data);
  return unwrap<BoardResponse>(response);
};

export const getBoard = async (id: string): Promise<BoardResponse> => {
  const response = await api.get<unknown>(`/boards/${id}`);
  return unwrap<BoardResponse>(response);
};

export const updateBoard = async (
  id: string,
  data: Partial<CreateBoardInput>,
): Promise<BoardResponse> => {
  const response = await api.patch<unknown>(`/boards/${id}`, data);
  return unwrap<BoardResponse>(response);
};

export const deleteBoard = async (id: string): Promise<void> => {
  await api.delete<void>(`/boards/${id}`);
};

// Lists API
export const getLists = async (boardId: string): Promise<ListResponse[]> => {
  const response = await api.get<unknown>(`/lists?boardId=${boardId}`);
  return unwrap<ListResponse[]>(response);
};

export const createList = async (data: CreateListInput): Promise<ListResponse> => {
  const response = await api.post<unknown>('/lists', data);
  return unwrap<ListResponse>(response);
};

export const updateList = async (id: string, data: UpdateListInput): Promise<ListResponse> => {
  const response = await api.patch<unknown>(`/lists/${id}`, data);
  return unwrap<ListResponse>(response);
};

export const deleteList = async (id: string): Promise<void> => {
  await api.delete<void>(`/lists/${id}`);
};

// Tasks API
export const getTasks = async (listId: string): Promise<TaskResponse[]> => {
  const response = await api.get<unknown>(`/tasks?listId=${listId}`);
  return unwrap<TaskResponse[]>(response);
};

export const createTask = async (data: CreateTaskInput): Promise<TaskResponse> => {
  const response = await api.post<unknown>('/tasks', data);
  return unwrap<TaskResponse>(response);
};

export const updateTask = async (id: string, data: UpdateTaskInput): Promise<TaskResponse> => {
  const response = await api.patch<unknown>(`/tasks/${id}`, data);
  return unwrap<TaskResponse>(response);
};

export const deleteTask = async (id: string): Promise<void> => {
  await api.delete<void>(`/tasks/${id}`);
};

export const getPriorities = async (projectId: string): Promise<PrioritySummary[]> => {
  const response = await api.get<unknown>(`/priorities?projectId=${projectId}&limit=100`);
  const unwrapped = unwrap<unknown>(response);
  if (Array.isArray(unwrapped)) return unwrapped as PrioritySummary[];
  if (
    unwrapped &&
    typeof unwrapped === 'object' &&
    'data' in unwrapped &&
    Array.isArray((unwrapped as { data: unknown }).data)
  ) {
    return (unwrapped as { data: PrioritySummary[] }).data;
  }
  return [];
};

export const createPriority = async (data: {
  projectId: string;
  name: string;
  color: string;
  order?: number;
}): Promise<PrioritySummary> => {
  const response = await api.post<unknown>('/priorities', data);
  return unwrap<PrioritySummary>(response);
};

export const deletePriority = async (id: string): Promise<void> => {
  await api.delete<void>(`/priorities/${id}`);
};
