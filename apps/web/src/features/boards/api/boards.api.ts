import { api } from '@/lib/api-client';
import {
  CreateBoardInput,
  CreateListInput,
  UpdateListInput,
  CreateTaskInput,
  UpdateTaskInput,
} from '../schemas/board.schema';
import { BoardResponse, BoardSummary, ListResponse, TaskResponse } from '../types/board.types';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// Boards API
export const getBoards = async (projectId: string): Promise<BoardSummary[]> => {
  const response = await api.get<ApiResponse<BoardSummary[]>>(`/boards?projectId=${projectId}`);
  return response.data;
};

export const createBoard = async (data: CreateBoardInput): Promise<BoardResponse> => {
  const response = await api.post<ApiResponse<BoardResponse>>('/boards', data);
  return response.data;
};

export const getBoard = async (id: string): Promise<BoardResponse> => {
  const response = await api.get<ApiResponse<BoardResponse>>(`/boards/${id}`);
  return response.data;
};

// Lists API
export const getLists = async (boardId: string): Promise<ListResponse[]> => {
  const response = await api.get<ApiResponse<ListResponse[]>>(`/lists?boardId=${boardId}`);
  return response.data;
};

export const createList = async (data: CreateListInput): Promise<ListResponse> => {
  const response = await api.post<ApiResponse<ListResponse>>('/lists', data);
  return response.data;
};

export const updateList = async (id: string, data: UpdateListInput): Promise<ListResponse> => {
  const response = await api.patch<ApiResponse<ListResponse>>(`/lists/${id}`, data);
  return response.data;
};

export const deleteList = async (id: string): Promise<void> => {
  await api.delete<void>(`/lists/${id}`);
};

// Tasks API
export const getTasks = async (listId: string): Promise<TaskResponse[]> => {
  const response = await api.get<ApiResponse<TaskResponse[]>>(`/tasks?listId=${listId}`);
  return response.data;
};

export const createTask = async (data: CreateTaskInput): Promise<TaskResponse> => {
  const response = await api.post<ApiResponse<TaskResponse>>('/tasks', data);
  return response.data;
};

export const updateTask = async (id: string, data: UpdateTaskInput): Promise<TaskResponse> => {
  const response = await api.patch<ApiResponse<TaskResponse>>(`/tasks/${id}`, data);
  return response.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await api.delete<void>(`/tasks/${id}`);
};
