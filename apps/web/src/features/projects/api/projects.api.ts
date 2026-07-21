import { api } from '@/lib/api-client';
import { CreateProjectInput } from '../schemas/project.schema';
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
