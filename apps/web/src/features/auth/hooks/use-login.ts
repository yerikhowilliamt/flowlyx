import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { login } from '../api/auth.api';
import { LoginInput } from '../schemas/auth.schema';

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginInput) => login(data),
    onSuccess: (data) => {
      // TODO: Store token securely
      console.log('Login successful, token:', data.access_token);
      router.push('/');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to login';
      toast.error(message);
    },
  });
};
