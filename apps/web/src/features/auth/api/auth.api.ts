import { api } from '@/lib/api-client';
import { User } from '@flowlyx/database';
import { LoginInput, RegisterInput } from '../schemas/auth.schema';
import { AuthTokens } from '../types/auth.types';

export const login = (data: LoginInput) => api.post<AuthTokens>('/auth/login', data);

export const register = (data: RegisterInput) => api.post<User>('/auth/register', data);
