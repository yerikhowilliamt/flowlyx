import { api } from '@/lib/api-client';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export const getMe = async (): Promise<UserProfile> => {
  const response = await api.get<ApiResponse<UserProfile>>('/users/me');
  return response.data;
};

export const updateProfile = async (id: string, data: FormData): Promise<UserProfile> => {
  const response = await api.patch<ApiResponse<UserProfile>>(`/users/${id}`, data);
  return response.data;
};
