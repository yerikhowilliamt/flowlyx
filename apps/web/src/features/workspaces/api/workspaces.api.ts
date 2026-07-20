import { api } from '@/lib/api-client';
import { CreateWorkspaceInput, UpdateWorkspaceInput } from '../schemas/workspace.schema';
import { WorkspaceResponse, WorkspaceSummary } from '../types/workspace.types';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export const getWorkspaces = async (organizationId: string): Promise<WorkspaceSummary[]> => {
  const response = await api.get<ApiResponse<WorkspaceSummary[]>>(
    `/workspaces?organizationId=${organizationId}`,
  );
  return response.data;
};

export const getWorkspaceById = async (id: string): Promise<WorkspaceResponse> => {
  const response = await api.get<ApiResponse<WorkspaceResponse>>(`/workspaces/${id}`);
  return response.data;
};

export const getWorkspaceBySlug = async (slug: string): Promise<WorkspaceResponse> => {
  const response = await api.get<ApiResponse<WorkspaceResponse>>(`/workspaces/slug/${slug}`);
  return response.data;
};

export const createWorkspace = async (data: CreateWorkspaceInput): Promise<WorkspaceResponse> => {
  const response = await api.post<ApiResponse<WorkspaceResponse>>('/workspaces', data);
  return response.data;
};

export const updateWorkspace = async (
  id: string,
  data: UpdateWorkspaceInput,
): Promise<WorkspaceResponse> => {
  const response = await api.patch<ApiResponse<WorkspaceResponse>>(`/workspaces/${id}`, data);
  return response.data;
};

export const deleteWorkspace = async (id: string): Promise<void> => {
  await api.delete<void>(`/workspaces/${id}`);
};
