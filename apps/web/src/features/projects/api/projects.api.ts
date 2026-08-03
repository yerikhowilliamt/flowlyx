import { api } from '@/lib/api-client';
import { CreateProjectInput, UpdateProjectInput } from '../schemas/project.schema';
import { ProjectResponse, ProjectSummary } from '../types/project.types';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export const getProjects = async (workspaceId: string): Promise<ProjectSummary[]> => {
  const response = await api.get<ApiResponse<ProjectSummary[]>>(
    `/projects?workspaceId=${workspaceId}`,
  );
  return response.data;
};

export const createProject = async (data: CreateProjectInput): Promise<ProjectResponse> => {
  const response = await api.post<ApiResponse<ProjectResponse>>('/projects', data);
  return response.data;
};

export const updateProject = async (
  id: string,
  data: UpdateProjectInput,
): Promise<ProjectResponse> => {
  const response = await api.patch<ApiResponse<ProjectResponse>>(`/projects/${id}`, data);
  return response.data;
};

export const deleteProject = async (id: string): Promise<void> => {
  await api.delete<void>(`/projects/${id}`);
};
