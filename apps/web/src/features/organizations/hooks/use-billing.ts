import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getBillingInfo, updateBillingPlan } from '../api/organizations.api';
import { UpdatePlanPayload } from '../types/organization.types';

export const useBillingInfo = (organizationId: string) => {
  return useQuery({
    queryKey: ['billing', organizationId],
    queryFn: () => getBillingInfo(organizationId),
    enabled: !!organizationId,
  });
};

export const useUpdateBillingPlan = (organizationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePlanPayload) => updateBillingPlan(organizationId, data),
    onSuccess: (res) => {
      toast.success('Plan updated successfully');
      queryClient.invalidateQueries({ queryKey: ['billing', organizationId] });
      if (res.redirectUrl) {
        window.open(res.redirectUrl, '_blank');
      }
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to update billing plan';
      toast.error(message);
    },
  });
};
