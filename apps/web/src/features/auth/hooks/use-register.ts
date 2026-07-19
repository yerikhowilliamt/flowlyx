import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { register } from '../api/auth.api';
import { RegisterInput } from '../schemas/auth.schema';

export const useRegister = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterInput) => register(data),
    onSuccess: () => {
      // TODO: Add toast notification for success
      router.push('/login');
    },
    onError: (error) => {
      // TODO: Handle error with toast notification
      console.error('Registration failed:', error);
    },
  });
};
