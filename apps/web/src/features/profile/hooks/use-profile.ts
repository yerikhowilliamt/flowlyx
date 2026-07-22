import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMe, updateProfile } from '../api/profile.api';

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
