import { api } from '@/lib/api-client';
import { ProjectMember, CreateProjectMemberPayload, UpdateProjectMemberPayload } from '../types/project-member.types';
import { ApiResponse } from '@/features/admin/types/admin.types';

export const getProjectMembers = async (projectId: string): Promise<ProjectMember[]> => {
  const response = await api.get<ApiResponse<ProjectMember[]> | ProjectMember[]>(`/project-members/project/${projectId}`);
  return typeof response === 'object' && response !== null && 'data' in response
    ? (response as ApiResponse<ProjectMember[]>).data
    : (response as ProjectMember[]);
};

export const createProjectMember = async (payload: CreateProjectMemberPayload): Promise<ProjectMember> => {
  const response = await api.post<ApiResponse<ProjectMember> | ProjectMember>('/project-members', payload);
  return typeof response === 'object' && response !== null && 'data' in response
    ? (response as ApiResponse<ProjectMember>).data
    : (response as ProjectMember);
};

export const updateProjectMember = async (id: string, payload: UpdateProjectMemberPayload): Promise<ProjectMember> => {
  const response = await api.patch<ApiResponse<ProjectMember> | ProjectMember>(`/project-members/${id}`, payload);
  return typeof response === 'object' && response !== null && 'data' in response
    ? (response as ApiResponse<ProjectMember>).data
    : (response as ProjectMember);
};

export const deleteProjectMember = async (id: string): Promise<{ success: boolean }> => {
  const response = await api.delete<ApiResponse<{ success: boolean }> | { success: boolean }>(`/project-members/${id}`);
  return typeof response === 'object' && response !== null && 'data' in response
    ? (response as ApiResponse<{ success: boolean }>).data
    : (response as { success: boolean });
};
