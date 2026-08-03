import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMe, updateProfile, deleteAccount } from '../api/profile.api';
import { useRouter } from 'next/navigation';

export const useMe = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => updateProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => deleteAccount(id),
    onSuccess: () => {
      document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      queryClient.clear();
      router.push('/login');
    },
  });
};
