import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getWorkspaces,
  getWorkspaceBySlug,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
} from '../api/workspaces.api';
import { CreateWorkspaceInput, UpdateWorkspaceInput } from '../schemas/workspace.schema';

export const useWorkspaces = (organizationId: string) => {
  return useQuery({
    queryKey: ['workspaces', { organizationId }],
    queryFn: () => getWorkspaces(organizationId),
    enabled: !!organizationId,
  });
};

export const useWorkspace = (slug: string) => {
  return useQuery({
    queryKey: ['workspace', { slug }],
    queryFn: () => getWorkspaceBySlug(slug),
    enabled: !!slug,
  });
};

export const useCreateWorkspace = (organizationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkspaceInput) => createWorkspace(data),
    onSuccess: () => {
      toast.success('Workspace created successfully');
      queryClient.invalidateQueries({ queryKey: ['workspaces', { organizationId }] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to create workspace';
      toast.error(message);
    },
  });
};

export const useUpdateWorkspace = (organizationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkspaceInput }) =>
      updateWorkspace(id, data),
    onSuccess: (workspace) => {
      toast.success('Workspace updated successfully');
      queryClient.invalidateQueries({ queryKey: ['workspaces', { organizationId }] });
      queryClient.invalidateQueries({ queryKey: ['workspace', { slug: workspace.slug }] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to update workspace';
      toast.error(message);
    },
  });
};

export const useDeleteWorkspace = (organizationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteWorkspace(id),
    onSuccess: () => {
      toast.success('Workspace deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['workspaces', { organizationId }] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to delete workspace';
      toast.error(message);
    },
  });
};
