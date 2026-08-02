import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getBillingInfo, updateBillingPlan, syncBillingTransaction } from '../api/organizations.api';
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
      toast.success('Redirecting to payment page...');
      if (res.redirectUrl && res.orderId) {
        window.open(res.redirectUrl, '_blank');

        const orderId = res.orderId;
        const maxAttempts = 100;
        let attempts = 0;

        const poll = setInterval(async () => {
          attempts++;
          try {
            const result = await syncBillingTransaction(orderId);
            if (result.status === 'SETTLEMENT') {
              clearInterval(poll);
              toast.success('Payment confirmed! Subscription updated.');
              queryClient.invalidateQueries({ queryKey: ['billing', organizationId] });
            } else if (result.status === 'CANCEL') {
              clearInterval(poll);
              toast.error('Payment was cancelled or failed.');
            }
          } catch {
            // silent — keep polling
          }
          if (attempts >= maxAttempts) {
            clearInterval(poll);
          }
        }, 3000);
      }
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to update billing plan';
      toast.error(message);
    },
  });
};
