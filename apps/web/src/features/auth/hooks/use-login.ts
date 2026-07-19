import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
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
      // TODO: Handle error with toast notification
      console.error('Login failed:', error);
    },
  });
};
