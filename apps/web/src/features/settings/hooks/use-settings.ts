import { useQuery as useReactQuery, useMutation as useReactMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, getPublicSettings, getSettingByKey, createSetting, updateSetting, deleteSetting } from '../api/settings.api';
import { CreateSettingPayload, UpdateSettingPayload, Setting } from '../types/settings.types';
import { AdminPaginationParams } from '@/features/admin/types/admin.types';

export const useSettings = (params?: AdminPaginationParams) => {
  return useReactQuery<Setting[], Error>({
    queryKey: ['admin-settings', params],
    queryFn: () => getSettings(params),
  });
};

export const usePublicSettings = (params?: AdminPaginationParams) => {
  return useReactQuery<Setting[], Error>({
    queryKey: ['public-settings', params],
    queryFn: () => getPublicSettings(params),
  });
};

export const useSettingByKey = (key: string) => {
  return useReactQuery<Setting, Error>({
    queryKey: ['admin-setting', key],
    queryFn: () => getSettingByKey(key),
    enabled: !!key,
  });
};

export const useCreateSetting = () => {
  const queryClient = useQueryClient();
  return useReactMutation<Setting, Error, CreateSettingPayload>({
    mutationFn: createSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-settings'] });
    },
  });
};

export const useUpdateSetting = () => {
  const queryClient = useQueryClient();
  return useReactMutation<Setting, Error, { id: string; payload: UpdateSettingPayload }>({
    mutationFn: ({ id, payload }) => updateSetting(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-settings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-setting', data.key] });
    },
  });
};

export const useDeleteSetting = () => {
  const queryClient = useQueryClient();
  return useReactMutation<{ success: boolean }, Error, string>({
    mutationFn: deleteSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-settings'] });
    },
  });
};
