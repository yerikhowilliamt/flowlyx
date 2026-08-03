import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createOrganization } from '../api/organizations.api';
import { CreateOrganizationInput } from '../schemas/organization.schema';

export const useCreateOrganization = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrganizationInput) => createOrganization(data),
    onSuccess: () => {
      toast.success('Organization created successfully');
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      // Redirect to the newly created organization's workspace page once it exists
      // For now, redirect to the organization listing page
      router.push('/organizations');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to create organization';
      toast.error(message);
    },
  });
};
