import { api } from '@/lib/api-client';
import { ApiResponse, PaginatedResponse, AdminPaginationParams } from '@/features/admin/types/admin.types';
import { Setting, CreateSettingPayload, UpdateSettingPayload } from '../types/settings.types';

function formatResponse<T>(res: unknown): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res as T[];
  if (typeof res === 'object' && res !== null && 'data' in res) {
    const inner = (res as { data: unknown }).data;
    if (Array.isArray(inner)) return inner as T[];
    if (
      inner &&
      typeof inner === 'object' &&
      'data' in inner &&
      Array.isArray((inner as { data: unknown }).data)
    ) {
      return (inner as { data: T[] }).data;
    }
  }
  return [];
}

export const getSettings = async (params?: AdminPaginationParams): Promise<Setting[]> => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.search) query.append('search', params.search);

  const url = `/settings${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await api.get<ApiResponse<Setting[]> | Setting[] | PaginatedResponse<Setting>>(url);
  return formatResponse<Setting>(response);
};

export const getPublicSettings = async (params?: AdminPaginationParams): Promise<Setting[]> => {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.search) query.append('search', params.search);

  const url = `/settings/public${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await api.get<ApiResponse<Setting[]> | Setting[] | PaginatedResponse<Setting>>(url);
  return formatResponse<Setting>(response);
};

export const getSettingByKey = async (key: string): Promise<Setting> => {
  const response = await api.get<ApiResponse<Setting> | Setting>(`/settings/${key}`);
  return typeof response === 'object' && response !== null && 'data' in response
    ? (response as ApiResponse<Setting>).data
    : (response as Setting);
};

export const createSetting = async (payload: CreateSettingPayload): Promise<Setting> => {
  const response = await api.post<ApiResponse<Setting> | Setting>('/settings', payload);
  return typeof response === 'object' && response !== null && 'data' in response
    ? (response as ApiResponse<Setting>).data
    : (response as Setting);
};

export const updateSetting = async (id: string, payload: UpdateSettingPayload): Promise<Setting> => {
  const response = await api.patch<ApiResponse<Setting> | Setting>(`/settings/${id}`, payload);
  return typeof response === 'object' && response !== null && 'data' in response
    ? (response as ApiResponse<Setting>).data
    : (response as Setting);
};

export const deleteSetting = async (id: string): Promise<{ success: boolean }> => {
  const response = await api.delete<ApiResponse<{ success: boolean }> | { success: boolean }>(`/settings/${id}`);
  return typeof response === 'object' && response !== null && 'data' in response
    ? (response as ApiResponse<{ success: boolean }>).data
    : (response as { success: boolean });
};
