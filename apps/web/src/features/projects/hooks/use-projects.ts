import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getProjects, createProject } from '../api/projects.api';
import { CreateProjectInput } from '../schemas/project.schema';

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
