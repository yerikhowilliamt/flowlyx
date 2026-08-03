import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getProjects, createProject, updateProject, deleteProject } from '../api/projects.api';
import { CreateProjectInput, UpdateProjectInput } from '../schemas/project.schema';

export const useProjects = (workspaceId: string) => {
  return useQuery({
    queryKey: ['projects', { workspaceId }],
    queryFn: () => getProjects(workspaceId),
    enabled: !!workspaceId,
  });
};

export const useCreateProject = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectInput) => createProject(data),
    onSuccess: () => {
      toast.success('Project created successfully');
      queryClient.invalidateQueries({ queryKey: ['projects', { workspaceId }] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to create project';
      toast.error(message);
    },
  });
};

export const useUpdateProject = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectInput }) => updateProject(id, data),
    onSuccess: () => {
      toast.success('Project updated successfully');
      queryClient.invalidateQueries({ queryKey: ['projects', { workspaceId }] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to update project';
      toast.error(message);
    },
  });
};

export const useDeleteProject = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      toast.success('Project deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['projects', { workspaceId }] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to delete project';
      toast.error(message);
    },
  });
};
