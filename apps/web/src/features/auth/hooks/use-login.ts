import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { login } from '../api/auth.api';
import { LoginInput } from '../schemas/auth.schema';
import { setAccessToken } from '@/lib/api-client';

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginInput) => login(data),
    onSuccess: (data) => {
      setAccessToken(data.access_token);
      console.log('Login successful, token set in memory.');
      router.push('/');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to login';
      toast.error(message);
    },
  });
};
