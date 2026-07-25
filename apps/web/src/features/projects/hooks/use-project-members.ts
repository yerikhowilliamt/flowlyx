import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjectMembers, createProjectMember, updateProjectMember, deleteProjectMember } from '../api/project-members.api';
import { ProjectMember, CreateProjectMemberPayload, UpdateProjectMemberPayload } from '../types/project-member.types';

export const useProjectMembers = (projectId: string) => {
  return useQuery<ProjectMember[], Error>({
    queryKey: ['project-members', projectId],
    queryFn: () => getProjectMembers(projectId),
    enabled: !!projectId,
  });
};

export const useCreateProjectMember = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation<ProjectMember, Error, CreateProjectMemberPayload>({
    mutationFn: createProjectMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
    },
  });
};

export const useUpdateProjectMember = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation<ProjectMember, Error, { id: string; payload: UpdateProjectMemberPayload }>({
    mutationFn: ({ id, payload }) => updateProjectMember(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
    },
  });
};

export const useDeleteProjectMember = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: deleteProjectMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
    },
  });
};
