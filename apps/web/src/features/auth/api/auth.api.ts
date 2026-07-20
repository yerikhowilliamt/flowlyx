import { api } from '@/lib/api-client';
import { User } from '@flowlyx/database';
import { LoginInput, RegisterInput } from '../schemas/auth.schema';
import { AuthTokens } from '../types/auth.types';

interface ApiResponse<T> {
  data: T;
}

export const login = async (data: LoginInput): Promise<AuthTokens> => {
  const response = await api.post<ApiResponse<AuthTokens>>('/auth/login', data);
  return response.data;
};

export const register = async (data: RegisterInput): Promise<User> => {
  const response = await api.post<ApiResponse<User>>('/auth/register', data);
  return response.data;
};
