import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getOrganizations, updateOrganization, deleteOrganization } from '../api/organizations.api';
import { UpdateOrganizationInput } from '../schemas/organization.schema';

export const useOrganizations = () => {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: getOrganizations,
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrganizationInput }) =>
      updateOrganization(id, data),
    onSuccess: (org) => {
      toast.success('Organization updated successfully');
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organization', org.slug] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to update organization';
      toast.error(message);
    },
  });
};

export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteOrganization(id),
    onSuccess: () => {
      toast.success('Organization deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to delete organization';
      toast.error(message);
    },
  });
};
