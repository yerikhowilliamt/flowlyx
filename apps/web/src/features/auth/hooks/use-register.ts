import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { register } from '../api/auth.api';
import { RegisterInput } from '../schemas/auth.schema';

export const useRegister = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterInput) => register(data),
    onSuccess: () => {
      toast.success('Registration successful! Please login.');
      router.push('/login');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
    },
  });
};
