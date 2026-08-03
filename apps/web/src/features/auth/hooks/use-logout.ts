import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { logout } from '../api/auth.api';

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.clear();
      toast.success('Logged out successfully');
      router.push('/login');
    },
    onError: (error) => {
      queryClient.clear();
      const message = error instanceof Error ? error.message : 'Logged out';
      toast.info(message);
      router.push('/login');
    },
  });
};
